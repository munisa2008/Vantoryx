from unittest.mock import patch

from django.test import TestCase


class _Msg:
    def __init__(self, content: str):
        self.content = content


class _Choice:
    def __init__(self, content: str):
        self.message = _Msg(content)


class _Completion:
    def __init__(self, content: str):
        self.choices = [_Choice(content)]


class NexaWhatToReplyTests(TestCase):
    def test_recorder_template_has_reply_card(self):
        resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "Режим «что ответить?»")
        self.assertContains(resp, "replyTextInput")

    @patch("apps.nexa.views.client.chat.completions.create")
    def test_reply_endpoint_returns_message_and_checklist(self, mock_create):
        mock_create.return_value = _Completion(
            '{"reply_message":"Я не могу помочь с этим запросом. Проверю через официальный канал.","dont_do":["Не сообщать коды","Не переходить по ссылкам","Не переводить деньги","Не устанавливать приложения","Не давать удалённый доступ"]}'
        )

        resp = self.client.post(
            "/api/reply/",
            data='{"text":"Срочно назовите код из SMS"}',
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("reply_message", data)
        self.assertIn("dont_do", data)
        self.assertTrue(isinstance(data["dont_do"], list))
        self.assertGreaterEqual(len(data["dont_do"]), 5)
        self.assertTrue(len(data["reply_message"]) > 0)

    @patch("apps.nexa.views.client.chat.completions.create")
    def test_reply_endpoint_fallback_on_bad_json(self, mock_create):
        mock_create.return_value = _Completion("NOT JSON")

        resp = self.client.post(
            "/api/reply/",
            data='{"text":"Скиньте номер карты"}',
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertGreaterEqual(len(data.get("dont_do", [])), 5)
        self.assertTrue(len(data.get("reply_message", "")) > 0)


class NexaHumanRewriteTests(TestCase):
    def test_recorder_template_has_rewrite_card(self):
        resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "Режим «перепиши как нормальный человек»")
        self.assertContains(resp, "rewriteTextInput")

    @patch("apps.nexa.views.client.chat.completions.create")
    def test_rewrite_endpoint_returns_honest_version(self, mock_create):
        mock_create.return_value = _Completion(
            '{"honest_version":"Мы пытаемся выманить у вас данные и заставить перейти по [ссылка].","red_flags":["срочность","ссылка","просьба кода"]}'
        )

        resp = self.client.post(
            "/api/rewrite/",
            data='{"text":"Ваш аккаунт заблокирован. Срочно перейдите по ссылке!"}',
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("honest_version", data)
        self.assertIn("red_flags", data)
        self.assertTrue(len(data["honest_version"]) > 0)

    @patch("apps.nexa.views.client.chat.completions.create")
    def test_rewrite_endpoint_fallback_on_bad_json(self, mock_create):
        mock_create.return_value = _Completion("BAD")

        resp = self.client.post(
            "/api/rewrite/",
            data='{"text":"Срочно оплатите штраф"}',
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(len(data.get("honest_version", "")) > 0)


class NexaReversePhishingTests(TestCase):
    def test_recorder_template_has_reverse_card(self):
        resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "Режим «обратный фишинг»")
        self.assertContains(resp, "reverseTextInput")

    @patch("apps.nexa.views.client.chat.completions.create")
    def test_reverse_endpoint_returns_reply_and_self_check(self, mock_create):
        mock_create.return_value = _Completion(
            '{"reply_message":"Сейчас не могу ответить. Проверю позже через официальный сайт/приложение.","self_check_verdict":"safe","self_check_issues":[]}'
        )

        resp = self.client.post(
            "/api/reverse/",
            data='{"text":"Срочно назовите код из SMS"}',
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("reply_message", data)
        self.assertIn("self_check_verdict", data)
        self.assertIn("self_check_issues", data)
        self.assertTrue(len(data["reply_message"]) > 0)

    @patch("apps.nexa.views.client.chat.completions.create")
    def test_reverse_endpoint_fallback_on_bad_json(self, mock_create):
        mock_create.return_value = _Completion("NOPE")

        resp = self.client.post(
            "/api/reverse/",
            data='{"text":"Оплатите штраф по ссылке"}',
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(len(data.get("reply_message", "")) > 0)
        self.assertIn(data.get("self_check_verdict"), {"safe", "leaky", "uncertain"})
