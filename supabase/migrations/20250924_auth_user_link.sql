-- Add auth_user_id and FK to auth.users
alter table if exists public.profiles
  add column if not exists auth_user_id uuid;

do $$ begin
  alter table public.profiles
    add constraint profiles_auth_user_id_fkey
    foreign key (auth_user_id) references auth.users(id) on delete cascade;
exception when duplicate_object then null; end $$;

-- Update trigger to insert into auth_user_id instead of id
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (auth_user_id, email)
  values (new.id, new.email)
  on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row
  execute procedure public.handle_new_user();
