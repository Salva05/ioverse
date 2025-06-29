from rest_framework import serializers

class UsageQueryParams(serializers.Serializer):
    start_time = serializers.IntegerField()
    end_time   = serializers.IntegerField()
    bucket_width = serializers.CharField(default="1d")
    models    = serializers.ListField(child=serializers.CharField(), required=False)
    group_by  = serializers.ListField(child=serializers.CharField(), required=False)
