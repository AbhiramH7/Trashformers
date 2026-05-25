import requests
from django.conf import settings


def geocode_address(address: str) -> tuple[float | None, float | None]:
    """
    Convert an address string to (latitude, longitude) using Google Geocoding API.
    Returns (None, None) if geocoding fails or API key is not set.
    """
    api_key = getattr(settings, 'GOOGLE_MAPS_API_KEY', None)
    if not api_key or not address:
        return None, None

    try:
        response = requests.get(
            'https://maps.googleapis.com/maps/api/geocode/json',
            params={'address': address, 'key': api_key},
            timeout=5,
        )
        data = response.json()
        if data.get('status') == 'OK' and data.get('results'):
            loc = data['results'][0]['geometry']['location']
            return loc['lat'], loc['lng']
    except Exception:
        pass

    return None, None
