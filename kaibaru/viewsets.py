from django.utils import timezone
from rest_framework import viewsets, serializers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Member, Club, Lesson, Participation, SlateImage
from accounts.models import CustomUser
from django.contrib.auth import login

import json

from .serializers import MemberSerializer, ClubSerializer, LessonSerializer, ParticipationSerializer, SlateImageSerializer
from django.conf import settings

class SlateImageViewSet(viewsets.ModelViewSet):
    queryset = SlateImage.objects.all()
    serializer_class = SlateImageSerializer

    def perform_create(self, serializer):
        club_id = self.request.data.get("club")
        serializer.save(club_id=club_id)

class ClubViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer

    @action(detail=False, methods=["get"], url_path="by-subdomain/(?P<subdomain>[^/.]+)")
    def by_subdomain(self, request, subdomain=None):
        club = self.get_queryset().filter(subdomain=subdomain).first()
        if not club:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(club, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="create-trial")
    def create_trial(self, request):
        """
        Only allow trial club creation if user is on the main page (no subdomain)
        """
        subdomain = request.data.get("subdomain")
        name = request.data.get("name")
        if not name:
            return Response({"name": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        if not subdomain:
            return Response({"subdomain": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        club = Club.objects.create(subdomain=subdomain, name=name, owner=request.user)

        serializer = self.get_serializer(club, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["patch"], url_path="update_slate_section/(?P<section>[^/.]+)")
    def update_slate_section(self, request, pk=None, section=None):
        """
        Generic endpoint to update a Slate editor section and its images.
        section must be one of: home, trial, system, contact
        """
        if section not in {"home", "trial", "system", "contact"}:
            return Response({"detail": "Invalid section"}, status=status.HTTP_400_BAD_REQUEST)

        club = self.get_object()
        section_data = request.data.get(section)
        images_data = request.data.get(f"{section}_images", "[]")

        # Parse section JSON if it's a string
        if isinstance(section_data, str):
            try:
                section_data = json.loads(section_data)
            except json.JSONDecodeError:
                pass

        # Parse images JSON if it's a string
        if isinstance(images_data, str):
            try:
                images_data = json.loads(images_data)
            except json.JSONDecodeError:
                images_data = []

        # Save section JSON into club.<section>
        if section_data is not None:
            if isinstance(section_data, (list, dict)):
                setattr(club, section, json.dumps(section_data))
            else:
                setattr(club, section, section_data)
            club.save()

        # Handle SlateImage objects
        for idx, img in enumerate(images_data):
            img_id = img.get("id")
            uploaded_file = request.FILES.get(f"{section}_files_{idx}")  # actual file

            if img_id:
                try:
                    slate_img = SlateImage.objects.get(id=img_id, club=club)
                    if uploaded_file:
                        slate_img.image = uploaded_file
                    slate_img.category = section  # update category just in case
                    slate_img.save()
                    img["url"] = slate_img.image.url
                except SlateImage.DoesNotExist:
                    continue
            else:
                if uploaded_file:
                    slate_img = SlateImage.objects.create(
                        club=club,
                        category=section,
                        image=uploaded_file,
                    )
                    img["url"] = slate_img.image.url

        # Delete SlateImages no longer referenced in JSON
        image_ids_in_section = set()
        if isinstance(section_data, list):
            for node in section_data:
                children = node.get("children", [])
                for child in children:
                    if child.get("type") == "image" and "id" in child:
                        image_ids_in_section.add(child["id"])

        SlateImage.objects.filter(club=club, category=section).exclude(id__in=image_ids_in_section).delete()

        # Save final section JSON
        if section_data is not None:
            setattr(club, section, json.dumps(section_data))
            club.save()

        serializer = self.get_serializer(club, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer

    def perform_create(self, serializer):
        subdomain = self.request.data.get("club_subdomain")
        if not subdomain:
            raise serializers.ValidationError({"club_subdomain": "This field is required."})

        club = Club.objects.filter(subdomain=subdomain).first()
        if not club:
            raise serializers.ValidationError({"club_subdomain": "Club not found."})


        serializer.save(club=club, user=self.request.user)


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer

    def perform_create(self, serializer):
        subdomain = self.request.data.get("club_subdomain")
        if not subdomain:
            raise serializers.ValidationError({"club_subdomain": "This field is required."})

        club = Club.objects.filter(subdomain=subdomain).first()
        if not club:
            raise serializers.ValidationError({"club_subdomain": "Club not found."})
        
        instructor = None
        instructor_id = self.request.data.get("instructor_id")
        if instructor_id:
            try:
                instructor_id = int(instructor_id)
                instructor = Member.objects.filter(id=instructor_id, is_instructor=True).first()
            except ValueError:
                raise serializers.ValidationError({"instructor_id": "Invalid ID."})

            if not instructor:
                raise serializers.ValidationError({"instructor_id": "Instructor not found or not valid."})

        serializer.save(club=club, instructor=instructor)

class ParticipationViewSet(viewsets.ModelViewSet):
    queryset = Participation.objects.all()
    serializer_class = ParticipationSerializer

    @action(detail=False, methods=["post"], url_path="toggle-count")
    def toggle_count(self, request):
        member_id = request.data.get("member")
        lesson_id = request.data.get("lesson")

        if not member_id or not lesson_id:
            return Response(
                {"detail": "member and lesson are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        member = Member.objects.filter(id=member_id).first()
        lesson = Lesson.objects.filter(id=lesson_id).first()

        if not member or not lesson:
            return Response(
                {"detail": "Member or lesson not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        today = timezone.localtime(timezone.now()).date()
        level_key = str(member.level)

        participation = Participation.objects.filter(member=member, lesson=lesson).first()

        if participation:
            if participation.level_counts is None:
                participation.level_counts = {}

            if participation.last_participation_date == today:
                participation.total_count = max(participation.total_count - 1, 0)
                participation.monthly_count = max(participation.monthly_count - 1, 0)
                participation.level_counts[level_key] = max(
                    participation.level_counts.get(level_key, 0) - 1, 0
                )
                if participation.level_counts[level_key] == 0:
                    del participation.level_counts[level_key]
                participation.last_participation_date = participation.second_last_participation_date
            else:
                participation.total_count += 1
                participation.monthly_count += 1
                participation.level_counts[level_key] = participation.level_counts.get(level_key, 0) + 1
                if participation.second_last_participation_date != participation.last_participation_date:
                    participation.second_last_participation_date = participation.last_participation_date
                participation.last_participation_date = today

            participation.save()
        else:
            participation = Participation.objects.create(
                member=member,
                lesson=lesson,
                total_count=1,
                monthly_count=1,
                level_counts={level_key: 1},
                last_participation_date=today,
                second_last_participation_date=today
            )

        serializer = ParticipationSerializer(participation)
        return Response(serializer.data, status=status.HTTP_200_OK)
