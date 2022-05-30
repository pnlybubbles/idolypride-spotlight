SET check_function_bodies = false;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
-- COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';
CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;
CREATE TABLE public.ability (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id text NOT NULL,
    type text NOT NULL,
    condition text,
    target text,
    amount integer,
    span integer,
    skill_id uuid NOT NULL,
    condition_value integer,
    enhance text,
    enhance_value integer
);
COMMENT ON TABLE public.ability IS 'アイドルの保有するスキルの効果';
CREATE TABLE public.fumen (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id text NOT NULL,
    title text NOT NULL,
    beat integer DEFAULT 0 NOT NULL,
    a jsonb,
    sp jsonb,
    unit text NOT NULL
);
COMMENT ON TABLE public.fumen IS '譜面';
CREATE TABLE public.idol (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id text NOT NULL,
    name text NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    role text NOT NULL
);
COMMENT ON TABLE public.idol IS 'アイドル';
CREATE TABLE public.idol_role (
    value text NOT NULL,
    comment text NOT NULL
);
COMMENT ON TABLE public.idol_role IS 'アイドルロール (enum table)';
CREATE TABLE public.idol_type (
    value text NOT NULL,
    comment text NOT NULL
);
COMMENT ON TABLE public.idol_type IS 'アイドルタイプ (enum table)';
CREATE TABLE public.skill (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    ct integer,
    idol_id uuid NOT NULL,
    level integer NOT NULL,
    trigger text,
    trigger_value integer,
    index integer NOT NULL
);
COMMENT ON TABLE public.skill IS 'アイドルの保有するスキル';
CREATE TABLE public.skill_type (
    value text NOT NULL,
    comment text NOT NULL
);
COMMENT ON TABLE public.skill_type IS 'スキルタイプ (enum table)';
CREATE TABLE public."user" (
    id text NOT NULL,
    email text,
    last_seen timestamp with time zone DEFAULT now() NOT NULL,
    allow boolean DEFAULT false NOT NULL
);
COMMENT ON TABLE public."user" IS 'ユーザー';
ALTER TABLE ONLY public.ability
    ADD CONSTRAINT ability_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.fumen
    ADD CONSTRAINT fumen_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.idol
    ADD CONSTRAINT idol_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.idol_role
    ADD CONSTRAINT idol_role_pkey PRIMARY KEY (value);
ALTER TABLE ONLY public.idol_type
    ADD CONSTRAINT idol_type_pkey PRIMARY KEY (value);
ALTER TABLE ONLY public.skill
    ADD CONSTRAINT skill_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.skill_type
    ADD CONSTRAINT skill_type_pkey PRIMARY KEY (value);
ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);
CREATE TRIGGER set_public_ability_updated_at BEFORE UPDATE ON public.ability FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_ability_updated_at ON public.ability IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_public_fumen_updated_at BEFORE UPDATE ON public.fumen FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_fumen_updated_at ON public.fumen IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_public_idol_updated_at BEFORE UPDATE ON public.idol FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_idol_updated_at ON public.idol IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_public_skill_updated_at BEFORE UPDATE ON public.skill FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_skill_updated_at ON public.skill IS 'trigger to set value of column "updated_at" to current timestamp on row update';
ALTER TABLE ONLY public.ability
    ADD CONSTRAINT ability_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skill(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.idol
    ADD CONSTRAINT idol_role_fkey FOREIGN KEY (role) REFERENCES public.idol_role(value) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.idol
    ADD CONSTRAINT idol_type_fkey FOREIGN KEY (type) REFERENCES public.idol_type(value) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.skill
    ADD CONSTRAINT skill_idol_id_fkey FOREIGN KEY (idol_id) REFERENCES public.idol(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public.skill
    ADD CONSTRAINT skill_type_fkey FOREIGN KEY (type) REFERENCES public.skill_type(value) ON UPDATE RESTRICT ON DELETE RESTRICT;
