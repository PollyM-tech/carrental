from django.test import SimpleTestCase
from .phone_numbers import normalise_phone


class InternationalPhoneTests(SimpleTestCase):
    def test_international_formats(self):
        for raw, expected in [("+44 7700 900123", "+447700900123"), ("+1 (202) 555-0123", "+12025550123"), ("+91 98765 43210", "+919876543210"), ("+256 772 123456", "+256772123456"), ("0044 7700 900123", "+447700900123")]:
            with self.subTest(raw=raw):
                self.assertEqual(normalise_phone(raw), expected)

    def test_kenyan_local_formats(self):
        self.assertEqual(normalise_phone("0716 741 039"), "+254716741039")
        self.assertEqual(normalise_phone("0116 741 039"), "+254116741039")
        self.assertEqual(normalise_phone("254716741039"), "+254716741039")

    def test_invalid_numbers(self):
        for raw in [None, "", "2025550123", "++123456789", "+0123456789", "+123456", "+1234567890123456", "+447700abc123"]:
            with self.subTest(raw=raw):
                with self.assertRaises(ValueError):
                    normalise_phone(raw)
