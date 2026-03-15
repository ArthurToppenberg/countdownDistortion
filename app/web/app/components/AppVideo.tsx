import { type VideoHTMLAttributes } from "react";
import { assetPath } from "../lib/assetPath";

type AppVideoSource = {
  src: string;
  type: string;
};

type AppVideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, "src"> & {
  src?: string;
  sources?: AppVideoSource[];
};

export function AppVideo({ src, sources, ...props }: AppVideoProps) {
  return (
    <video {...(src ? { src: assetPath(src) } : {})} {...props}>
      {sources?.map((source) => (
        <source
          key={source.src}
          src={assetPath(source.src)}
          type={source.type}
        />
      ))}
    </video>
  );
}
