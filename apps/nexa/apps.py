from django.apps import AppConfig
import threading


class NexaConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.nexa'

    def ready(self):
        def _warm():
            from .transcribe import warmup_model
            try:
                warmup_model()
            except Exception:
                pass
        threading.Thread(target=_warm, daemon=True).start()
