-- PostgreSQL schema for SocialConnect (Supabase compatible)

create type public.role as enum ('user','admin');
create type public.visibility as enum ('public','private','followers_only');
create type public.notification_type as enum ('follow','like','comment');
create type public.post_category as enum ('general','announcement','question');

-- Users/Profile Table
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  username text unique not null,
  first_name text not null,
  last_name text not null,
  bio text,
  avatar_url text,
  website text,
  location text,
  visibility public.visibility not null default 'public',
  role public.role not null default 'user',
  password_hash text not null,
  is_verified boolean not null default false,
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_username on public.profiles (username);

-- Profile counts helper
create or replace function public.get_user_profile_with_counts(p_user_id uuid)
returns table (
  id uuid,
  email text,
  username text,
  first_name text,
  last_name text,
  bio text,
  avatar_url text,
  website text,
  location text,
  visibility public.visibility,
  role public.role,
  created_at timestamptz,
  updated_at timestamptz,
  followers_count bigint,
  following_count bigint,
  posts_count bigint
) language sql stable as $$
  select p.id, p.email, p.username, p.first_name, p.last_name, p.bio, p.avatar_url, p.website, p.location,
         p.visibility, p.role, p.created_at, p.updated_at,
         (select count(*) from public.follows f where f.following = p.id) as followers_count,
         (select count(*) from public.follows f where f.follower = p.id) as following_count,
         (select count(*) from public.posts ps where ps.author = p.id)   as posts_count
  from public.profiles p where p.id = p_user_id;
$$;

-- Posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) <= 280),
  image_url text,
  category public.post_category not null default 'general',
  is_active boolean not null default true,
  like_count int not null default 0,
  comment_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_posts_author_created on public.posts (author, created_at desc);

-- Follows
create table if not exists public.follows (
  follower uuid not null references public.profiles(id) on delete cascade,
  following uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower, following),
  check (follower <> following)
);
create index if not exists idx_follows_following on public.follows (following);

-- Likes
create table if not exists public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
create index if not exists idx_likes_post on public.likes (post_id);

-- Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) <= 200),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_comments_post_created on public.comments (post_id, created_at desc);

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient uuid not null references public.profiles(id) on delete cascade,
  sender uuid not null references public.profiles(id) on delete cascade,
  notification_type public.notification_type not null,
  post_id uuid references public.posts(id) on delete set null,
  message text not null check (char_length(message) <= 200),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_recipient_created on public.notifications (recipient, created_at desc);

-- Counters maintenance triggers
create or replace function public.increment_like_count() returns trigger as $$
begin
  update public.posts set like_count = like_count + 1 where id = NEW.post_id;
  return NEW;
end;
$$ language plpgsql;

create or replace function public.decrement_like_count() returns trigger as $$
begin
  update public.posts set like_count = greatest(like_count - 1, 0) where id = OLD.post_id;
  return OLD;
end;
$$ language plpgsql;

drop trigger if exists trg_like_insert on public.likes;
create trigger trg_like_insert after insert on public.likes for each row execute procedure public.increment_like_count();

drop trigger if exists trg_like_delete on public.likes;
create trigger trg_like_delete after delete on public.likes for each row execute procedure public.decrement_like_count();

create or replace function public.increment_comment_count() returns trigger as $$
begin
  update public.posts set comment_count = comment_count + 1 where id = NEW.post_id;
  return NEW;
end;
$$ language plpgsql;

create or replace function public.decrement_comment_count() returns trigger as $$
begin
  update public.posts set comment_count = greatest(comment_count - 1, 0) where id = OLD.post_id;
  return OLD;
end;
$$ language plpgsql;

drop trigger if exists trg_comment_insert on public.comments;
create trigger trg_comment_insert after insert on public.comments for each row execute procedure public.increment_comment_count();

drop trigger if exists trg_comment_delete on public.comments;
create trigger trg_comment_delete after delete on public.comments for each row execute procedure public.decrement_comment_count();

-- Realtime: enable broadcasts on notifications table (Supabase config handled in dashboard)

