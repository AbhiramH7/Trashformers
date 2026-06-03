import requests

BASE_URL = "http://127.0.0.1:8000/api"

def run_integration_test():
    print("=== STARTING INTEGRATION TEST ===")
    
    # 1. Fetch Categories
    print("\n1. Fetching categories...")
    response = requests.get(f"{BASE_URL}/listings/categories/")
    assert response.status_code == 200, f"Failed to get categories: {response.text}"
    categories = response.json()
    print("Categories fetched:", [c["name"] for c in categories])
    
    # Find ID of plastic category
    plastic_id = None
    for cat in categories:
        if cat["name"] == "plastic":
            plastic_id = cat["id"]
            break
    assert plastic_id is not None, "Plastic category not found in DB."
    
    # 2. Register Seller
    print("\n2. Registering Seller...")
    seller_data = {
        "username": "test_seller",
        "email": "test_seller@example.com",
        "password": "TestPassword123!",
        "password2": "TestPassword123!",
        "first_name": "Test",
        "last_name": "Seller",
        "phone": "9876543210"
    }
    # Clear existing if any (just in case)
    # We will try to register, if fails due to username/email already exists, we will try to login
    response = requests.post(f"{BASE_URL}/auth/register/", json=seller_data)
    if response.status_code == 201:
        print("Seller registered successfully.")
        seller_tokens = response.json()["tokens"]
        seller_id = response.json()["user"]["id"]
    elif response.status_code == 400 and ("username" in response.json() or "email" in response.json()):
        print("Seller already registered. Logging in...")
        login_res = requests.post(f"{BASE_URL}/auth/login/", json={
            "username": "test_seller",
            "password": "TestPassword123!"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        seller_tokens = login_res.json()["tokens"]
        seller_id = login_res.json()["user"]["id"]
    else:
        assert False, f"Seller registration failed: {response.text}"
        
    # 3. Register Buyer
    print("\n3. Registering Buyer...")
    buyer_data = {
        "username": "test_buyer",
        "email": "test_buyer@example.com",
        "password": "TestPassword123!",
        "password2": "TestPassword123!",
        "first_name": "Test",
        "last_name": "Buyer",
        "phone": "8765432109"
    }
    response = requests.post(f"{BASE_URL}/auth/register/", json=buyer_data)
    if response.status_code == 201:
        print("Buyer registered successfully.")
        buyer_tokens = response.json()["tokens"]
        buyer_id = response.json()["user"]["id"]
    elif response.status_code == 400 and ("username" in response.json() or "email" in response.json()):
        print("Buyer already registered. Logging in...")
        login_res = requests.post(f"{BASE_URL}/auth/login/", json={
            "username": "test_buyer",
            "password": "TestPassword123!"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        buyer_tokens = login_res.json()["tokens"]
        buyer_id = login_res.json()["user"]["id"]
    else:
        assert False, f"Buyer registration failed: {response.text}"
        
    seller_headers = {"Authorization": f"Bearer {seller_tokens['access']}"}
    buyer_headers = {"Authorization": f"Bearer {buyer_tokens['access']}"}
    
    # 4. Update Profile Coordinates
    print("\n4. Updating profile coordinates...")
    # Seller coordinates (Bangalore Center)
    seller_profile_update = {
        "latitude": 12.9716,
        "longitude": 77.5946,
        "is_seller": True,
        "is_buyer": False
    }
    res = requests.put(f"{BASE_URL}/auth/profile/", json=seller_profile_update, headers=seller_headers)
    assert res.status_code == 200, f"Failed to update seller profile: {res.text}"
    
    # Buyer coordinates (Bangalore near Center)
    buyer_profile_update = {
        "latitude": 12.9718,
        "longitude": 77.5948,
        "is_buyer": True,
        "is_seller": False
    }
    res = requests.put(f"{BASE_URL}/auth/profile/", json=buyer_profile_update, headers=buyer_headers)
    assert res.status_code == 200, f"Failed to update buyer profile: {res.text}"
    print("Coordinates and roles updated.")
    
    # 5. Create Waste Listing (Seller)
    print("\n5. Creating Waste Listing...")
    listing_data = {
        "title": "PET Bottles Bulk",
        "description": "50kg of clean PET plastic bottles ready for recycling",
        "quantity": 50.0,
        "unit": "kg",
        "price_per_unit": 12.50,
        "category": plastic_id,
        "address": "MG Road, Bangalore"
    }
    response = requests.post(f"{BASE_URL}/listings/", json=listing_data, headers=seller_headers)
    assert response.status_code == 201, f"Failed to create listing: {response.text}"
    listing = response.json()
    listing_id = listing["id"]
    print(f"Listing created successfully. ID: {listing_id}, Title: {listing['title']}")
    
    # 6. Fetch Listings with Location and Verify Distance
    print("\n6. Fetching listings as Buyer...")
    # We pass coordinates of the buyer to calculate distance
    response = requests.get(f"{BASE_URL}/listings/?latitude=12.9718&longitude=77.5948", headers=buyer_headers)
    assert response.status_code == 200, f"Failed to fetch listings: {response.text}"
    listings_response = response.json()
    listings = listings_response["results"]
    assert listings_response["count"] > 0, "No listings returned."
    
    found = False
    for lst in listings:
        if lst["id"] == listing_id:
            found = True
            print(f"Found listing '{lst['title']}'. Calculated distance from buyer: {lst.get('distance_km')} km")
            break
    assert found, "Created listing not found in listing query."
    
    order_data = {
        "listing_id": listing_id,
        "quantity_ordered": 20.0,
        "pickup_date": "2026-06-10"
    }
    response = requests.post(f"{BASE_URL}/orders/create/", json=order_data, headers=buyer_headers)
    assert response.status_code == 201, f"Failed to create order: {response.text}"
    order = response.json()
    order_id = order["id"]
    print(f"Order placed successfully. ID: {order_id}, Total Price: {order['total_price']}, Status: {order['status']}")
    
    # 8. Accept Order (Seller)
    print("\n8. Accepting Order as Seller...")
    # Change status to 'accepted'
    response = requests.patch(f"{BASE_URL}/orders/{order_id}/", json={"status": "accepted"}, headers=seller_headers)
    assert response.status_code == 200, f"Failed to accept order: {response.text}"
    print(f"Order accepted. Status: {response.json()['order']['status']}")
    
    # 9. Complete Order (Seller)
    print("\n9. Completing Order as Seller...")
    # Change status to 'completed'
    response = requests.patch(f"{BASE_URL}/orders/{order_id}/", json={"status": "completed"}, headers=seller_headers)
    assert response.status_code == 200, f"Failed to complete order: {response.text}"
    print(f"Order completed. Status: {response.json()['order']['status']}")
    
    # 10. Submit Review (Buyer reviews Seller)
    print("\n10. Submitting Review for Seller...")
    review_data = {
        "order": order_id,
        "rating": 5,
        "comment": "Excellent quality plastic and very cooperative seller!"
    }
    response = requests.post(f"{BASE_URL}/reviews/", json=review_data, headers=buyer_headers)
    assert response.status_code == 201, f"Failed to submit review: {response.text}"
    print(f"Review submitted. ID: {response.json()['id']}, Reviewee: {response.json()['reviewee_username']}, Rating: {response.json()['rating']}")
    
    # 11. Verify Seller Public Profile Rating
    print("\n11. Verifying Seller Public Profile...")
    response = requests.get(f"{BASE_URL}/auth/users/{seller_id}/", headers=buyer_headers)
    assert response.status_code == 200, f"Failed to fetch seller public profile: {response.text}"
    profile = response.json()
    print(f"Seller username: {profile['username']}, Rating: {profile['rating']}")
    assert float(profile['rating']) == 5.0, f"Rating mismatch: {profile['rating']}"
    
    # 12. Submit Chat Message (Seller -> Buyer)
    print("\n12. Sending chat message from Seller to Buyer...")
    chat_data = {
        "recipient_id": buyer_id,
        "content": "Thanks for buying! Hope to trade with you again."
    }
    response = requests.post(f"{BASE_URL}/chat/send/", json=chat_data, headers=seller_headers)
    assert response.status_code == 201, f"Failed to send message: {response.text}"
    print("Chat message sent successfully.")
    
    # 13. Fetch Conversations & Message History (Buyer)
    print("\n13. Checking message history as Buyer...")
    # Fetch conversations
    response = requests.get(f"{BASE_URL}/chat/conversations/", headers=buyer_headers)
    assert response.status_code == 200, f"Failed to get conversations: {response.text}"
    convs_response = response.json()
    convs = convs_response["results"]
    assert convs_response["count"] > 0, "No conversations found."
    conv_id = convs[0]["id"]
    print(f"Found conversation ID: {conv_id} with {convs[0]['other_user']['username']}")
    
    # Fetch messages
    response = requests.get(f"{BASE_URL}/chat/conversations/{conv_id}/messages/", headers=buyer_headers)
    assert response.status_code == 200, f"Failed to get messages: {response.text}"
    msgs_response = response.json()
    msgs = msgs_response["results"]
    assert msgs_response["count"] > 0, "No messages in conversation."
    print(f"Last message content: '{msgs[0]['content']}' from {msgs[0]['sender']['username']}")
    
    # 14. File a Complaint (Seller against Buyer)
    print("\n14. Filing Complaint against Buyer...")
    complaint_data = {
        "reported_user": buyer_id,
        "complaint_type": "poor_service",
        "description": "Buyer did not follow the scheduled pick-up instructions properly."
    }
    response = requests.post(f"{BASE_URL}/complaints/", json=complaint_data, headers=seller_headers)
    assert response.status_code == 201, f"Failed to file complaint: {response.text}"
    print(f"Complaint filed successfully. ID: {response.json()['id']}, Status: {response.json()['status']}")
    
    # 15. View filed complaints (Seller)
    print("\n15. Fetching filed complaints...")
    response = requests.get(f"{BASE_URL}/complaints/mine/", headers=seller_headers)
    assert response.status_code == 200, f"Failed to get mine complaints: {response.text}"
    mine_complaints = response.json()["results"]
    assert len(mine_complaints) > 0, "No complaints found in list."
    print(f"Found filed complaint: '{mine_complaints[0]['description']}' (Type: {mine_complaints[0]['type_display']})")

    print("\n=== INTEGRATION TEST COMPLETED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_integration_test()
