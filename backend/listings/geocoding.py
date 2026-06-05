import requests


def geocode_address(address: str) -> tuple[float | None, float | None]:
    """
    Convert an address string to (latitude, longitude) using the free
    Nominatim API from OpenStreetMap.

    No API key required. Rate limit: 1 request/second (sufficient for
    listing creation flow).

    Returns (None, None) if geocoding fails.
    """
    if not address or not address.strip():
        return None, None

    try:
        response = requests.get(
            'https://nominatim.openstreetmap.org/search',
            params={
                'q': address.strip(),
                'format': 'json',
                'limit': 1,
                'addressdetails': 0,
            },
            headers={
                # Nominatim requires a descriptive User-Agent identifying your app
                'User-Agent': 'Trashformers/1.0 (waste-marketplace-hackathon)',
                'Accept-Language': 'en',
            },
            timeout=8,
        )
        data = response.json()
        if data and len(data) > 0:
            lat = float(data[0]['lat'])
            lon = float(data[0]['lon'])
            return lat, lon
    except Exception:
        pass

    return None, None
