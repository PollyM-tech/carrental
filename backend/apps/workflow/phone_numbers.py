"""Phone format normalisation, independent of delivery or ownership verification."""
import re


def normalise_phone(value):
    if not isinstance(value, str) or len(value) > 80 or re.search(r"[^0-9+\s().-]", value):
        raise ValueError("Enter your phone number with country code, for example +44 7700 900123.")
    phone = re.sub(r"[\s().-]", "", value.strip())
    if phone.startswith("00"):
        phone = "+" + phone[2:]
    elif re.fullmatch(r"0[17][0-9]{8}", phone):
        phone = "+254" + phone[1:]
    elif re.fullmatch(r"254[17][0-9]{8}", phone):
        phone = "+" + phone
    if not re.fullmatch(r"\+[1-9][0-9]{6,14}", phone):
        raise ValueError("Use + followed by your country code and number (7–15 digits). Kenyan 07… and 01… numbers are also accepted.")
    return phone
