from rest_framework import serializers
from .models import AudioTask


class AudioTaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AudioTask
        fields = ['id', 'file']


class AudioTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = AudioTask
        fields = [
            'id',
            'file',
            'status',
            'transcription',
            'summary',
        ]


class TextScamAnalysisRequestSerializer(serializers.Serializer):
    text = serializers.CharField(allow_blank=False, trim_whitespace=True, max_length=20000)


class TextScamAnalysisResponseSerializer(serializers.Serializer):
    verdict = serializers.ChoiceField(choices=["scam", "safe", "uncertain"])
    risk_score = serializers.IntegerField(min_value=0, max_value=100)
    reasons = serializers.ListField(child=serializers.CharField(), allow_empty=True)
    short_explanation = serializers.CharField(allow_blank=True)


class LinkAnalysisRequestSerializer(serializers.Serializer):
    text = serializers.CharField(allow_blank=False, trim_whitespace=True, max_length=20000)


class LinkAnalysisItemSerializer(serializers.Serializer):
    url = serializers.CharField()
    final_url = serializers.CharField(allow_blank=True)
    domain = serializers.CharField(allow_blank=True)
    verdict = serializers.ChoiceField(choices=["danger", "neutral", "unknown"])
    risk_score = serializers.IntegerField(min_value=0, max_value=100)
    reasons = serializers.ListField(child=serializers.CharField(), allow_empty=True)
    redirects = serializers.ListField(child=serializers.CharField(), allow_empty=True)


class LinkAnalysisResponseSerializer(serializers.Serializer):
    verdict = serializers.ChoiceField(choices=["danger", "neutral", "unknown"])
    risk_score = serializers.IntegerField(min_value=0, max_value=100)
    extracted_urls = serializers.ListField(child=serializers.CharField(), allow_empty=True)
    items = LinkAnalysisItemSerializer(many=True)
