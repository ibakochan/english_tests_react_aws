import json
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Student, Teacher, Classroom
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async


User = get_user_model()

@database_sync_to_async
def get_shared_users(current_user):
    try:
        if Student.objects.filter(user=current_user).exists():
            classroom_ids = Student.objects.get(user=current_user).classrooms.values_list("id", flat=True)
        elif Teacher.objects.filter(user=current_user).exists():
            classroom_ids = Teacher.objects.get(user=current_user).classrooms.values_list("id", flat=True)
        else:
            return []

        qs = (
            User.objects.filter(student__classrooms__id__in=classroom_ids)
            | User.objects.filter(teacher__classrooms__id__in=classroom_ids)
        ).distinct().select_related("student")

        data = []
        connected = SimpleConsumer.connected_users.keys()
        for u in qs:
            if u.username in connected:
                data.append({
                    "username": u.username,
                    "student_number": getattr(getattr(u, "student", None), "student_number", None),
                })
        return data

    except Exception as e:
        print(f"Error in get_shared_usernames: {e}")
        return []





class SimpleConsumer(AsyncWebsocketConsumer):
    connected_users = {} 

    async def connect(self):
        self.room_name = "test_room"
        self.username = self.scope["user"].username if self.scope["user"].is_authenticated else "Guest"
        self.user = self.scope["user"]
        SimpleConsumer.connected_users[self.username] = self.channel_name

        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()


        shared_users = await get_shared_users(self.user)

        my_student_number = next(
            (u["student_number"] for u in shared_users if u["username"] == self.username),
            None,
        )

        await self.send(text_data=json.dumps({
            "type": "shared_user_list",
            "users": shared_users,
        }))


    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_name, self.channel_name)
        SimpleConsumer.connected_users.pop(self.username, None)

        my_student_number = getattr(getattr(self.user, "student", None), "student_number", None)
        shared_users = await get_shared_users(self.user)


    async def user_joined(self, event):
        await self.send(text_data=json.dumps({
            "type": "user_joined",
            "username": event["username"],
            "student_number": event.get("student_number"),   
        }))
    
    async def user_left(self, event):
        await self.send(text_data=json.dumps({
            "type": "user_left",
            "username": event["username"],
            "student_number": event.get("student_number"),   
        }))

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data["type"]

        if message_type == "invitation":
            await self.handle_invitation(data)
        elif message_type == "invitation_accept":
            await self.handle_invitation_accept(data)
        elif message_type == "invitation_decline":
            await self.handle_invitation_decline(data)
        elif message_type == "category_toggle":
            await self.handle_category_toggle(data)
        elif message_type == "test_toggle":
            await self.handle_test_toggle(data)
        elif message_type == "answer_submit":
            await self.handle_answer_submit(data)
        elif message_type == "run":
            await self.handle_run(data)
        elif message_type == "battle_tests":
            await self.handle_battle_tests(data)

    async def handle_answer_submit(self, data):
        target_username = data["target_username"]
        answered_wrong = data["answered_wrong"]
        time_stamp = int(time.time() * 1000)

        if target_username in SimpleConsumer.connected_users:
            target_channel_name = SimpleConsumer.connected_users[target_username]
            await self.channel_layer.send(target_channel_name, {
                "type": "answer_submit",
                "answered_wrong": answered_wrong,
                "time_stamp": time_stamp,
            })
        
        await self.send(text_data=json.dumps({
            "type": "answer_submit_echo",
            "answered_wrong": answered_wrong,
            "time_stamp": time_stamp,
        }))
    
    async def answer_submit(self, event):
        await self.send(text_data=json.dumps({
            "type": "answer_submit",
            "answered_wrong": event["answered_wrong"],
            "time_stamp": event["time_stamp"]
        }))

    async def handle_test_toggle(self, data):
        target_username = data["target_username"]
        test = data["test"]
        randomized_values = data.get("randomizedValues")
        randomized_options = data.get("randomizedOptions")
        questions = data.get("questions")
        test_questions = data.get("testQuestions")
        total_questions = data.get("totalQuestions")

        if target_username in SimpleConsumer.connected_users:
            target_channel_name = SimpleConsumer.connected_users[target_username]
            await self.channel_layer.send(target_channel_name, {
                "type": "test_toggle",
                "test": test,
                "randomizedValues": randomized_values,
                "randomizedOptions": randomized_options,
                "questions": questions,
                "testQuestions": test_questions,
                "totalQuestions": total_questions,
            })

    async def test_toggle(self, event):
        await self.send(text_data=json.dumps({
            "type": "test_toggle",
            "test": event["test"],
            'yo': "go",
            "randomizedValues": event.get("randomizedValues"),
            "randomizedOptions": event.get("randomizedOptions"),
            "questions": event.get("questions"),
            "testQuestions": event.get("testQuestions"),
            "totalQuestions": event.get("totalQuestions")
        }))

    async def handle_category_toggle(self, data):
        target_username = data["target_username"]
        category = data["category"]

        if target_username in SimpleConsumer.connected_users:
            target_channel_name = SimpleConsumer.connected_users[target_username]
            await self.channel_layer.send(target_channel_name, {
                "type": "category_toggle",
                "category": category,
            })
    

    async def category_toggle(self, event):
        await self.send(text_data=json.dumps({
            "type": "category_toggle",
            "category": event["category"],
        }))

    
    async def handle_invitation(self, data):
        target_username = data["target_username"]
        if target_username in SimpleConsumer.connected_users:
            target_channel_name = SimpleConsumer.connected_users[target_username]
            await self.channel_layer.send(target_channel_name, {
                "type": "invitation",
                "sender_username": self.username,
            })
        else:
            await self.send(text_data=json.dumps({
                "type": "user_not_found",
                "message": "ユーザーネーム間違っているか、相手がオフライン"
            }))

    async def handle_invitation_accept(self, data):
        sender_username = data["sender_username"]
        if sender_username in SimpleConsumer.connected_users:
            sender_channel_name = SimpleConsumer.connected_users[sender_username]
            await self.channel_layer.send(sender_channel_name, {
                "type": "invitation_accept",
                "target_username": self.username,
                "inviter": data["inviting"],
            })

    async def handle_invitation_decline(self, data):
        sender_username = data["sender_username"]
        if sender_username in SimpleConsumer.connected_users:
            sender_channel_name = SimpleConsumer.connected_users[sender_username]
            await self.channel_layer.send(sender_channel_name, {
                "type": "invitation_decline",
                "target_username": self.username,
            })

    async def invitation(self, event):
        await self.send(text_data=json.dumps({
            "type": "invitation",
            "sender_username": event["sender_username"],
        }))

    async def invitation_accept(self, event):
        await self.send(text_data=json.dumps({
            "type": "invitation_accept",
            "target_username": event["target_username"],
            "inviter": True,
        }))

    async def invitation_decline(self, event):
        await self.send(text_data=json.dumps({
            "type": "invitation_decline",
            "target_username": event["target_username"],
        }))

    async def user_not_found(self, event):
        await self.send(text_data=json.dumps({
            "type": "user_not_found",
            "message": event["message"],
        }))


    async def handle_run(self, data):
        target_username = data["target_username"]

        if target_username in SimpleConsumer.connected_users:
            target_channel_name = SimpleConsumer.connected_users[target_username]
            await self.channel_layer.send(target_channel_name, {
                "type": "run",
                "target_username": target_username,
            })
    

    async def run(self, event):
        await self.send(text_data=json.dumps({
            "type": "run",
            "target_username": event["target_username"],
        }))


    async def handle_battle_tests(self, data):
        target_username = data["target_username"]
        battle_tests = data["battle_tests"]

        if target_username in SimpleConsumer.connected_users:
            target_channel_name = SimpleConsumer.connected_users[target_username]
            await self.channel_layer.send(target_channel_name, {
                "type": "battle_tests",
                "battle_tests": battle_tests,
            })

    async def battle_tests(self, event):
        await self.send(text_data=json.dumps({
            "type": "battle_tests",
            "battle_tests": event["battle_tests"],
        }))