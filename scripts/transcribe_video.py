"""Transcrit l'audio d'une vidéo .mp4 avec Whisper (sans ffmpeg système).

Usage: python transcribe_video.py <chemin_video> [modele]
  modele par défaut : "base"  (tiny, base, small, medium, large)
"""
import os
import subprocess
import sys
import tempfile
import wave

import numpy as np
import imageio_ffmpeg
import whisper


def extract_audio(video_path: str) -> str:
    """Extrait l'audio en WAV mono 16 kHz vers un fichier temporaire et renvoie son chemin."""
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    tmp_wav = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
    cmd = [
        ffmpeg, "-y", "-i", video_path,
        "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
        tmp_wav,
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return tmp_wav


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python transcribe_video.py <chemin_video> [modele]")
        sys.exit(1)

    video_path = sys.argv[1]
    model_name = sys.argv[2] if len(sys.argv) > 2 else "base"

    print(f"[1/3] Extraction audio de : {video_path}")
    wav_path = extract_audio(video_path)

    print(f"[2/3] Chargement du modèle Whisper '{model_name}'…")
    model = whisper.load_model(model_name)

    print("[3/3] Transcription en cours…")
    # Charger le WAV manuellement pour éviter que whisper rappelle ffmpeg
    with wave.open(wav_path, "rb") as wf:
        sr = wf.getframerate()
        n_frames = wf.getnframes()
        raw = wf.readframes(n_frames)
    audio = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    if sr != 16000:
        raise RuntimeError(f"sample rate inattendu: {sr}")
    result = model.transcribe(audio, fp16=False, verbose=False)

    print("\n===== LANGUE DÉTECTÉE =====")
    print(result.get("language", "inconnu"))

    print("\n===== TRANSCRIPTION =====")
    print(result["text"].strip())

    print("\n===== SEGMENTS HORODATÉS =====")
    for seg in result["segments"]:
        start = seg["start"]
        end = seg["end"]
        text = seg["text"].strip()
        print(f"[{start:7.2f}s -> {end:7.2f}s] {text}")

    try:
        os.unlink(wav_path)
    except OSError:
        pass


if __name__ == "__main__":
    main()
