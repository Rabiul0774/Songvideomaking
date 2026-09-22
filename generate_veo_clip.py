import os
import time

def get_genai_client(api_key: str = None):
    """
    Initializes and returns a Google GenAI Client with either an explicit key
    or from the GEMINI_API_KEY environment variable.
    """
    from google import genai
    key = api_key or os.getenv("GEMINI_API_KEY")
    if not key:
        raise ValueError(
            "GEMINI_API_KEY is not set. Please set the environment variable or pass api_key."
        )
    return genai.Client(api_key=key)

def generate_video_clip_google(visual_prompt: str, output_filename: str = "clip.mp4", api_key: str = None) -> str:
    """
    Submits a visual prompt to Google's Veo video generation model (veo-2.0-generate-001)
    and polls until complete, saving the final MP4.
    """
    from google.genai import types
    client = get_genai_client(api_key)

    print(f"🎬 Submitting prompt to Google Veo Video Generation:")
    print(f"   Prompt: {visual_prompt}")
    
    # 2. Initiate the video generation job
    operation = client.models.generate_videos(
        model="veo-2.0-generate-001",
        prompt=visual_prompt,
        config=types.GenerateVideosConfig(
            aspect_ratio="16:9",
            duration_seconds=5,
            resolution="720p"
        )
    )
    
    print(f"🚀 Job initiated: {operation.name}")
    print("⏳ Generating video... This usually takes 1–3 minutes.")

    # 3. Poll until Google finishes rendering the clip
    elapsed = 0
    while not operation.done:
        time.sleep(10)
        elapsed += 10
        operation = client.operations.get(operation)
        print(f"   ... still rendering ({elapsed}s elapsed)")

    print("✨ Video generation completed!")

    # 4. Save the generated MP4
    if hasattr(operation, 'result') and operation.result and operation.result.generated_videos:
        generated_video = operation.result.generated_videos[0]
        try:
            client.files.download(file=generated_video.video)
        except Exception:
            pass
        
        if hasattr(generated_video.video, 'save'):
            generated_video.video.save(output_filename)
        elif hasattr(generated_video.video, 'video_bytes'):
            with open(output_filename, 'wb') as f:
                f.write(generated_video.video.video_bytes)
        print(f"✅ Saved clip to: {output_filename}")
        return output_filename
    else:
        raise RuntimeError("No generated video found in operation result")

if __name__ == "__main__":
    test_prompt = "Cinematic wide shot, a solitary figure walking through a misty street in Kolkata at dawn, cinematic lighting, moody blue tones, 4k"
    try:
        saved_file = generate_video_clip_google(test_prompt, "kolkata_dawn.mp4")
    except Exception as e:
        print(f"\n[Execution Note]: {e}")
