alter table "public"."owned_idol" add constraint "owned_idol_idol_id_user_id_key" unique ("idol_id", "user_id");
