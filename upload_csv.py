import sys

import pandas as pd
from pocketbase import PocketBase
from pocketbase.client import ClientResponseError

if len(sys.argv) != 5:
    print(
        "Usage: python upload_csv.py <csv_path> <admin_user> <admin_password> <target_user>"
    )
    exit()

csv_path = sys.argv[1]
admin_user = sys.argv[2]
admin_password = sys.argv[3]
target_user = sys.argv[4]

client = PocketBase("https://pb.ellep.dev/")

try:
    admin_data = client.admins.auth_with_password(admin_user, admin_password)
except ClientResponseError as e:
    print("Could not authenticate as admin")
    exit()


df = pd.read_csv(csv_path)
pack_list = df["pack"].unique()


# Find user with email target_user
try:
    target_user = client.collection("users").get_one(target_user)
except ClientResponseError as e:
    print(f"Could not find user with id {target_user}")
    exit()

print(f"Found user {target_user}")


# Add to the collection "wordpacks" entries for each pack with values:
# - user: target_user
# - name: Pack <pack_number>
# - enabled: true
pack_refs = {}
for pack in pack_list:
    pack_name = f"Pack {pack}"
    try:
        pack_ref = client.collection("wordpacks").create(
            {"user": target_user.id, "name": pack_name, "enabled": True}
        )
        pack_refs[pack] = pack_ref.id
    except ClientResponseError as e:
        print(f"Could not create wordpack {pack_name}")
        print(e)
        exit()

print("Wordpacks created successfully")

# Add to the collection "words" entries for each word in the csv with values:
# - pack: pack_refs[pack]
# - characters: <characters>
# - pronunciation: <pronunciation>
# - translation: <translation>
for index, row in df.iterrows():
    pack_ref = pack_refs[row["pack"]]
    word = {
        "pack": pack_ref,
        "characters": row["characters"],
        "pronunciation": row["pronunciation"],
        "translation": row["translation"],
    }
    try:
        client.collection("words").create(word)
    except ClientResponseError as e:
        print(f"Could not create word {word}")
        exit()

print("Words created successfully")
