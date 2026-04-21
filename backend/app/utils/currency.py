from decimal import Decimal


_ZERO_DECIMAL_CURRENCIES = {
    "BIF",
    "CLP",
    "DJF",
    "GNF",
    "JPY",
    "KMF",
    "KRW",
    "MGA",
    "PYG",
    "RWF",
    "UGX",
    "VND",
    "VUV",
    "XAF",
    "XOF",
    "XPF",
}

_THREE_DECIMAL_CURRENCIES = {
    "BHD",
    "IQD",
    "JOD",
    "KWD",
    "LYD",
    "OMR",
    "TND",
}


def currency_exponent(currency: str | None) -> int:
    code = (currency or "").upper()
    if code in _ZERO_DECIMAL_CURRENCIES:
        return 0
    if code in _THREE_DECIMAL_CURRENCIES:
        return 3
    return 2


def minor_to_major(amount_minor: int, currency: str | None) -> float:
    exponent = currency_exponent(currency)
    return float(Decimal(int(amount_minor)) / (Decimal(10) ** exponent))
