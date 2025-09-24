-- Functions for comment likes/dislikes

CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.comments
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_comment_dislikes(comment_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.comments
  SET dislikes = COALESCE(dislikes, 0) + 1
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;