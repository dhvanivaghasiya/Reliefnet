import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'reliefnet_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from categories.models import Category
from campaigns.models import Campaign
from camps.models import Camp
from volunteers.models import Volunteer
from leaders.models import CampLeader
from donations.models import Donation

User = get_user_model()

def seed():
    # 1. Create or get Admin
    admin_user = User.objects.filter(username='admin').first()
    if not admin_user:
        admin_user = User.objects.create_superuser('admin', 'admin@reliefnet.com', 'admin123')
        print("Created Superuser: admin")
    else:
        admin_user.set_password('admin123')
        admin_user.email = 'admin@reliefnet.com'
        admin_user.is_superuser = True
        admin_user.is_staff = True
        admin_user.role = User.Role.SUPER_ADMIN
        admin_user.save()
        print("Reset existing Superuser 'admin' password to 'admin123'")

    # 2. Create or get Camp Leader
    leader_user = User.objects.filter(username='camp_leader_1').first()
    if not leader_user:
        leader_user = User.objects.create_user(
            username='camp_leader_1',
            email='leader1@reliefnet.com',
            password='leader123',
            role='CAMP_LEADER'
        )
        print("Created Camp Leader: camp_leader_1")
    else:
        leader_user.set_password('leader123')
        leader_user.role = 'CAMP_LEADER'
        leader_user.save()
        print("Reset existing Camp Leader 'camp_leader_1' password to 'leader123'")

    # 3. Create Categories
    cat_flood, _ = Category.objects.get_or_create(
        name='Flood Relief',
        defaults={'description': 'Support and supplies for affected areas in floods.'}
    )
    cat_earthquake, _ = Category.objects.get_or_create(
        name='Earthquake Relief',
        defaults={'description': 'Emergency medical assistance, food and temporary shelter for earthquake survivors.'}
    )
    cat_medical, _ = Category.objects.get_or_create(
        name='Medical Aid',
        defaults={'description': 'Essential medical camps, first aid kits and expert doctor consultations.'}
    )
    print("Created Categories.")

    # 4. Create Campaigns
    camp1, _ = Campaign.objects.get_or_create(
        title='Assam Flood Response 2026',
        defaults={
            'description': 'Providing food supplies, clean drinking water, and immediate medical assistance to families displaced by severe flooding in Assam districts.',
            'category': cat_flood,
            'status': 'ACTIVE',
            'creator': admin_user,
            'start_date': timezone.now(),
            'end_date': timezone.now() + timedelta(days=30),
            'target_amount': 50000.00,
        }
    )

    camp2, _ = Campaign.objects.get_or_create(
        title='Himalayan Earthquake Recovery',
        defaults={
            'description': 'Emergency disaster relief campaign to deploy immediate medical response units and rescue shelters following the recent high-intensity earthquake in the Himalayan foothills.',
            'category': cat_earthquake,
            'status': 'ACTIVE',
            'creator': admin_user,
            'start_date': timezone.now(),
            'end_date': timezone.now() + timedelta(days=60),
            'target_amount': 120000.00,
        }
    )
    print("Created Campaigns.")

    # 5. Create Camps
    g_camp, _ = Camp.objects.get_or_create(
        name='Guwahati Sports Stadium Shelter',
        defaults={
            'campaign': camp1,
            'address': 'G.S. Road, Christian Basti, Guwahati, Assam',
            'latitude': 26.1445,
            'longitude': 91.7362,
            'leader': leader_user,
            'contact_number': '+91 98765 43210',
            'description': 'Providing clean beds, hot community meals, and emergency medical kits. Capacity of 500 individuals.',
            'status': 'ACTIVE',
            'capacity': 500,
            'current_population': 320
        }
    )

    s_camp, _ = Camp.objects.get_or_create(
        name='Silchar District School Camp',
        defaults={
            'campaign': camp1,
            'address': 'Link Road, Tarapur, Silchar, Assam',
            'latitude': 24.8333,
            'longitude': 92.7789,
            'leader': leader_user,
            'contact_number': '+91 98765 43211',
            'description': 'Temporary flood response shelter established in partnership with Silchar Government High School.',
            'status': 'ACTIVE',
            'capacity': 300,
            'current_population': 110
        }
    )

    camp_shimla, _ = Camp.objects.get_or_create(
        name='Shimla Base Camp Alpha',
        defaults={
            'campaign': camp2,
            'address': 'Near Mall Road, Shimla, Himachal Pradesh',
            'latitude': 31.1048,
            'longitude': 77.1734,
            'leader': leader_user,
            'contact_number': '+91 98765 43212',
            'description': 'First-responder post equipped with heavy medical equipment, basic blankets, and clean water filtration systems.',
            'status': 'ACTIVE',
            'capacity': 800,
            'current_population': 650
        }
    )
    print("Created Camps.")

    # 6. Create Inventory Items
    from inventory.models import InventoryItem
    InventoryItem.objects.get_or_create(
        camp=g_camp,
        product_name='Bottled Water 1L Cases',
        defaults={
            'quantity': 150,
            'unit': 'boxes',
            'category': cat_flood
        }
    )

    InventoryItem.objects.get_or_create(
        camp=g_camp,
        product_name='Emergency Medical Supplies Kit',
        defaults={
            'quantity': 45,
            'unit': 'kits',
            'category': cat_medical
        }
    )

    InventoryItem.objects.get_or_create(
        camp=s_camp,
        product_name='Woolen Blankets',
        defaults={
            'quantity': 200,
            'unit': 'pcs',
            'category': cat_flood
        }
    )
    print("Created Inventory Items.")

    # 7. Create Volunteer and CampLeader applications with pending/active user accounts
    # Add Amit Sharma (pending volunteer)
    amit_user = User.objects.filter(username='amit_sharma').first()
    if not amit_user:
        amit_user = User.objects.create(
            username='amit_sharma',
            email='amit.sharma@example.com',
            phone='+91 99887 76655',
            address='Flat 4B, Metro Heights, Guwahati, Assam',
            role=User.Role.VOLUNTEER,
            is_active=False
        )
        amit_user.set_password('volunteer123')
        amit_user.save()
        
    Volunteer.objects.get_or_create(
        user=amit_user,
        defaults={
            'full_name': 'Amit Sharma',
            'age': 24,
            'email': 'amit.sharma@example.com',
            'phone': '+91 99887 76655',
            'gov_id': 'GOV-8899001122',
            'address': 'Flat 4B, Metro Heights, Guwahati, Assam',
            'current_city': 'Guwahati',
            'skills': 'First aid certified, fluent in Assamese and Hindi, logistics support.',
            'availability': 'Weekends Only',
            'reason_for_volunteering': 'I want to help the community recover from the recent heavy floods in the region.',
            'status': 'PENDING'
        }
    )

    # Add Priya Patel (approved volunteer)
    priya_user = User.objects.filter(username='priya_patel').first()
    if not priya_user:
        priya_user = User.objects.create(
            username='priya_patel',
            email='priya.patel@example.com',
            phone='+91 99887 76656',
            address='5th Block, Koramangala, Bangalore, Karnataka',
            role=User.Role.VOLUNTEER,
            is_active=True
        )
        priya_user.set_password('volunteer123')
        priya_user.save()
        
    Volunteer.objects.get_or_create(
        user=priya_user,
        defaults={
            'full_name': 'Priya Patel',
            'age': 28,
            'email': 'priya.patel@example.com',
            'phone': '+91 99887 76656',
            'gov_id': 'GOV-8899001123',
            'address': '5th Block, Koramangala, Bangalore, Karnataka',
            'current_city': 'Shimla',
            'skills': 'Medical student, basic health checkups, emergency response assistance.',
            'availability': 'Full Time',
            'reason_for_volunteering': 'Ready to dedicate my semester break assisting disaster camps.',
            'status': 'APPROVED'
        }
    )

    # Add Vikram Singh (pending leader)
    vikram_user = User.objects.filter(username='vikram_singh').first()
    if not vikram_user:
        vikram_user = User.objects.create(
            username='vikram_singh',
            email='vikram.singh@example.com',
            phone='+91 98765 12345',
            address='12 Sector 17, Chandigarh',
            role=User.Role.CAMP_LEADER,
            is_active=False
        )
        vikram_user.set_password('leader123')
        vikram_user.save()
        
    CampLeader.objects.get_or_create(
        user=vikram_user,
        defaults={
            'full_name': 'Vikram Singh',
            'age': 38,
            'email': 'vikram.singh@example.com',
            'phone': '+91 98765 12345',
            'gov_id': 'GOV-1122334455',
            'address': '12 Sector 17, Chandigarh',
            'camp_requested': 'Shimla Base Camp Alpha',
            'reason_for_applying': 'Over 8 years managing relief activities for national NGOs. Experienced in disaster-zone camp establishment.',
            'status': 'PENDING'
        }
    )
    print("Created Volunteer and CampLeader Applications.")

    # 8. Create Donations
    Donation.objects.get_or_create(
        full_name='Rohan Das',
        product_name='Premium Basmati Rice Bags 10kg',
        defaults={
            'camp': g_camp,
            'email': 'rohan.das@example.com',
            'phone': '+91 98888 77777',
            'category': cat_flood,
            'quantity': 50,
            'unit': 'bags',
            'description': 'High-quality shelf-stable raw rice packs.',
            'delivery_method': 'SELF_DELIVERY',
            'status': 'PENDING'
        }
    )

    Donation.objects.get_or_create(
        full_name='Aarav Mehta',
        product_name='Warm Thermal Blankets',
        defaults={
            'camp': s_camp,
            'email': 'aarav.mehta@example.com',
            'phone': '+91 98888 77778',
            'category': cat_flood,
            'quantity': 100,
            'unit': 'pcs',
            'description': 'Thick woolen blankets suited for sub-zero night temperatures.',
            'delivery_method': 'PICKUP_REQUEST',
            'status': 'ACCEPTED'
        }
    )
    print("Created Donation records.")

if __name__ == '__main__':
    seed()
