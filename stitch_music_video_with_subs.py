import os
import sys

# MoviePy 2.x+ imports directly from `moviepy`
try:
    from moviepy import VideoFileClip, AudioFileClip, concatenate_videoclips, TextClip, CompositeVideoClip
except ImportError:
    from moviepy.editor import VideoFileClip, AudioFileClip, concatenate_videoclips, TextClip, CompositeVideoClip

def create_subtitle_clip(text: str, font_path: str, video_width: int, video_duration: float, font_size: int = 44):
    """
    Creates a styled subtitle TextClip with outline/stroke and bottom positioning,
    compatible across MoviePy 1.x and 2.x+.
    """
    try:
        # MoviePy 2.x parameter names: `text`, `font_size`
        txt_clip = TextClip(
            text=text,
            font=font_path,
            font_size=font_size,
            color="white",
            stroke_color="black",
            stroke_width=2,
            method="caption",
            size=(int(video_width * 0.85), None)
        )
    except TypeError:
        # MoviePy 1.x parameter names: positional text, `fontsize`
        txt_clip = TextClip(
            text,
            font=font_path,
            fontsize=font_size,
            color="white",
            stroke_color="black",
            stroke_width=2,
            method="caption",
            size=(int(video_width * 0.85), None)
        )

    # Position at bottom center
    if hasattr(txt_clip, "with_position"):
        txt_clip = txt_clip.with_position(("center", "bottom")).with_duration(video_duration)
    else:
        txt_clip = txt_clip.set_position(("center", "bottom")).set_duration(video_duration)

    return txt_clip

def stitch_music_video_with_subs(scenes, audio_file=None, font_path="NotoSansBengali-Regular.ttf", output_filename="final_music_video.mp4"):
    """
    Stitches video clips sequentially, overlays synchronized lyrics/subtitles,
    attaches an audio track, and exports the final MP4.
    """
    print("🎬 Loading and subtitling video clips...")
    processed_clips = []

    for idx, scene in enumerate(scenes, 1):
        file_path = scene.get("file", "")
        lyric_text = scene.get("lyric", "").strip()

        if not os.path.exists(file_path):
            print(f"  ⚠️ Warning: Scene {idx} file '{file_path}' not found. Skipping.")
            continue

        try:
            clip = VideoFileClip(file_path)
            print(f"  ✓ Scene {idx}: Loaded '{file_path}' ({clip.duration:.1f}s)")

            if lyric_text:
                if not os.path.exists(font_path):
                    print(f"  ⚠️ Font '{font_path}' not found. Subtitles may use default font.")
                
                print(f"    ↳ Overlaying subtitle: \"{lyric_text}\"")
                txt_clip = create_subtitle_clip(
                    text=lyric_text,
                    font_path=font_path,
                    video_width=clip.w,
                    video_duration=clip.duration
                )
                composite = CompositeVideoClip([clip, txt_clip])
                processed_clips.append(composite)
            else:
                # Instrumental break
                processed_clips.append(clip)
        except Exception as e:
            print(f"  ❌ Error processing scene {idx} ('{file_path}'): {e}")

    if not processed_clips:
        print("❌ Error: No valid video clips found to stitch.")
        return None

    # Concatenate all scenes into a continuous sequence
    print(f"🎞️ Concatenating {len(processed_clips)} scenes...")
    final_video = concatenate_videoclips(processed_clips, method="compose")

    # Attach background music
    audio = None
    if audio_file and os.path.exists(audio_file):
        print(f"🎵 Attaching audio track: '{audio_file}'...")
        try:
            audio = AudioFileClip(audio_file)
            
            # Trim audio if it exceeds total video duration
            if audio.duration > final_video.duration:
                if hasattr(audio, "subclipped"):
                    audio = audio.subclipped(0, final_video.duration)
                else:
                    audio = audio.subclip(0, final_video.duration)

            if hasattr(final_video, "with_audio"):
                final_video = final_video.with_audio(audio)
            else:
                final_video = final_video.set_audio(audio)
        except Exception as e:
            print(f"  ⚠️ Warning attaching audio: {e}. Exporting without audio.")
    else:
        if audio_file:
            print(f"  ⚠️ Warning: Audio file '{audio_file}' not found. Exporting silent video.")

    # Export to final MP4
    print(f"🚀 Exporting subtitled music video to '{output_filename}'...")
    final_video.write_videofile(
        output_filename,
        fps=24,
        codec="libx264",
        audio_codec="aac" if audio else None,
        threads=4,
        logger=None
    )

    # Clean up handles
    for c in processed_clips:
        c.close()
    if audio:
        audio.close()
    final_video.close()

    print(f"✨ Success! Final music video saved as: {output_filename}")
    return output_filename

if __name__ == "__main__":
    scene_data = [
        {"file": "scene_1_kolkata.mp4", "lyric": "মেঘের কোলে রোদ হেসেছে"},
        {"file": "scene_2_train.mp4", "lyric": "বাদল গেছে টুটি"},
        {"file": "scene_3_rain.mp4", "lyric": ""}
    ]

    audio_path = "bengali_song.mp3"
    font_file = "NotoSansBengali-Regular.ttf"

    print("Verifying subtitled stitching pipeline...")
    stitch_music_video_with_subs(scene_data, audio_path, font_file, "Final_Subtitled_Video.mp4")
