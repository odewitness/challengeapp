import { embedUrl } from '../lib/video'

// Lecteur intégré selon la source. YouTube : iframe 16:9 (styles `.video-wrap`
// dans index.css). Instagram : carte portrait — pas d'autoplay ni d'événement
// de fin possible, c'est une limite de l'embed Instagram.
export default function VideoEmbed({ source = 'youtube', videoId, title }) {
  if (source === 'instagram') {
    return (
      <div className="ig-wrap">
        <iframe
          src={embedUrl({ source, video_id: videoId })}
          title={title || 'Vidéo Instagram'}
          allow="encrypted-media; picture-in-picture; clipboard-write"
          allowFullScreen
          loading="lazy"
          scrolling="no"
        />
        <style>{`
          .ig-wrap {
            width: 100%; max-width: 400px; margin: 0 auto;
            border-radius: var(--radius-m); overflow: hidden;
            background: var(--color-bg-raised); border: 1px solid var(--color-line);
          }
          .ig-wrap iframe { display: block; width: 100%; height: 600px; border: 0; }
        `}</style>
      </div>
    )
  }
  return (
    <div className="video-wrap">
      <iframe
        src={embedUrl({ source: 'youtube', video_id: videoId })}
        title={title || 'Vidéo'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  )
}
