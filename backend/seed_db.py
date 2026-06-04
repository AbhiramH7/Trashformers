import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from listings.models import Category

User = get_user_model()

def seed():
    print("Seeding database...")

    # 1. Seed Categories
    for code, label in Category.CATEGORY_CHOICES:
        category, created = Category.objects.get_or_create(
            name=code,
            defaults={
                'description': f'{label} waste materials',
                'icon': code
            }
        )
        if created:
            print(f"Created category: {label}")
        else:
            print(f"Category already exists: {label}")

    # 2. Seed Superuser
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@trashformers.com', 'adminpassword')
        print("Created superuser 'admin' / 'adminpassword'")
    else:
        print("Superuser 'admin' already exists.")

    # 3. Seed Test Seller
    if not User.objects.filter(username='test_seller').exists():
        User.objects.create_user(
            username='test_seller',
            email='test_seller@example.com',
            password='TestPassword123!',
            first_name='Test',
            last_name='Seller',
            phone='9876543210',
            is_seller=True,
            is_buyer=False,
            latitude=12.9716,
            longitude=77.5946
        )
        print("Created test seller 'test_seller' / 'TestPassword123!'")
    else:
        print("Test seller already exists.")

    # 4. Seed Test Buyer
    if not User.objects.filter(username='test_buyer').exists():
        buyer = User.objects.create_user(
            username='test_buyer',
            email='test_buyer@example.com',
            password='TestPassword123!',
            first_name='Test',
            last_name='Buyer',
            phone='8765432109',
            is_seller=False,
            is_buyer=True,
            latitude=12.9718,
            longitude=77.5948
        )
        print("Created test buyer 'test_buyer' / 'TestPassword123!'")
    else:
        print("Test buyer already exists.")

if __name__ == "__main__":
    seed()
