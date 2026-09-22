import os
import sys

# In MoviePy 2.x+, imports are direct from `moviepy` (not `moviepy.editor`)
try:
    from moviepy import VideoFileClip, AudioFileClip, concatenate_videoclips
except ImportError:
    from moviepy.editor import VideoFileClip, AudioFileClip, concatenate_videoclips

def stitch_music_video(video_files, audio_file=None, output_filename="final_music_video.mp4"):
    """
    Stitches multiple video files sequentially and overlays an audio track.
    Fully compatible with MoviePy 1.x and 2.x+.
    """
    print("🎬 Loading video clips...")
    video_clips = []
    
    # 1. Load all video files into MoviePy objects
    for file in video_files:
        if os.path.exists(file):
            try:
                clip = VideoFileClip(file)
                video_clips.append(clip)
                print(f"  ✓ Loaded: {file} ({clip.duration:.1f}s)")
            except Exception as e:
                print(f"  ⚠️ Error loading {file}: {e}")
        else:
            print(f"  ⚠️ Warning: File '{file}' not found. Skipping.")

    if not video_clips:
        print("❌ Error: No valid video clips found.")
        return None

    # 2. Concatenate all video clips sequentially
    print("🎞️ Stitching videos together...")
    final_video = concatenate_videoclips(video_clips, method="compose")

    # 3. Load the generated audio and attach it to the video sequence
    audio = None
    if audio_file and os.path.exists(audio_file):
        print(f"🎵 Attaching audio track: {audio_file}...")
        try:
            audio = AudioFileClip(audio_file)
            
            # If audio is longer than combined video, trim audio to match video duration
            if audio.duration > final_video.duration:
                # MoviePy v2 uses subclipped(), v1 uses subclip()
                if hasattr(audio, 'subclipped'):
                    audio = audio.subclipped(0, final_video.duration)
                elif hasattr(audio, 'subclip'):
                    audio = audio.subclip(0, final_video.duration)

            # MoviePy v2 uses with_audio(), v1 uses set_audio()
            if hasattr(final_video, 'with_audio'):
                final_video = final_video.with_audio(audio)
            elif hasattr(final_video, 'set_audio'):
                final_video = final_video.set_audio(audio)
        except Exception as e:
            print(f"  ⚠️ Warning attaching audio: {e}. Exporting silent video.")
    else:
        if audio_file:
            print(f"⚠️ Warning: Audio file '{audio_file}' not found. Exporting silent video.")
        else:
            print("ℹ️ No audio file specified. Exporting video only.")

    # 4. Export the final rendered MP4
    print(f"🚀 Exporting final video to {output_filename}...")
    final_video.write_videofile(
        output_filename,
        fps=24,                  # Standard cinematic framerate
        codec="libx264",         # Universal H.264 web compatibility
        audio_codec="aac" if audio else None,       # Standard AAC audio codec
        threads=4,               # Multi-threading for speed
        logger=None              # Set to 'bar' for console progress bar
    )

    # 5. Clean up memory
    for clip in video_clips:
        clip.close()
    if audio:
        audio.close()
    final_video.close()

    print(f"✨ Success! Your music video is ready: {output_filename}")
    return output_filename

if __name__ == "__main__":
    generated_videos = [
        "scene_1_kolkata.mp4", 
        "scene_2_train.mp4", 
        "scene_3_rain.mp4"
    ]
    generated_audio = "bengali_song.mp3"
    
    print("Testing stitch_music_video module...")
    # Will warn missing files if not generated yet, safely verifying the logic
    stitch_music_video(generated_videos, generated_audio, "My_AI_Music_Video.mp4")
