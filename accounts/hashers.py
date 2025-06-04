from django.contrib.auth.hashers import PBKDF2PasswordHasher

class CustomPBKDF2PasswordHasher(PBKDF2PasswordHasher):
    iterations = 1000  
