-- Relax constraints to allow auth trigger insert
alter table if exists public.profiles
  alter column username drop not null,
  alter column first_name drop not null,
  alter column last_name drop not null,
  alter column role set default 'user',
  alter column is_verified set default false;

-- Minimal trigger to insert profile on auth.users creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row
  execute procedure public.handle_new_user();
