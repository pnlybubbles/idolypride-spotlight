alter table "public"."owned_idol"
  add constraint "owned_idol_idol_id_fkey"
  foreign key ("idol_id")
  references "public"."idol"
  ("id") on update restrict on delete cascade;
