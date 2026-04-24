from aiogram.fsm.state import State, StatesGroup


class Flow(StatesGroup):
    waiting_text_scam = State()
    waiting_link_text = State()
    waiting_what_to_reply = State()
    waiting_human_rewrite = State()
    waiting_reverse_phishing = State()
    waiting_audio_file = State()
