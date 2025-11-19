from storages.backends.gcloud import GoogleCloudStorage

class PrivateMediaStorage(GoogleCloudStorage):
    bucket_name = "kaibaru"
    file_overwrite = False      
    querystring_auth = True