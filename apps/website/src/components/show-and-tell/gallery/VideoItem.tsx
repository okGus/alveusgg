import type { LinkAttachment } from "@prisma/client";
import React from "react";
import { parseVideoUrl, videoPlatformConfigs } from "@/utils/video-urls";
import { VideoPlatformIcon } from "@/components/shared/VideoPlatformIcon";

type VideoThumbnailProps = {
  videoAttachment: LinkAttachment;
  showIframeThumbnail?: boolean;
  openInLightbox?: boolean;
  linkAttributes?: Record<string, unknown> &
    React.AnchorHTMLAttributes<HTMLAnchorElement>;
};

export function VideoItem({
  videoAttachment,
  openInLightbox = false,
  showIframeThumbnail = false,
  linkAttributes = {},
}: VideoThumbnailProps) {
  const parsedVideoUrl = parseVideoUrl(videoAttachment.url);
  if (!parsedVideoUrl) {
    return null;
  }

  const { platform, id, normalizedUrl } = parsedVideoUrl;
  const videoPlatformConfig = videoPlatformConfigs[platform];

  // default attributes
  linkAttributes = {
    target: "_blank",
    rel: "noreferrer",
    ...linkAttributes,
  };

  let urlEmbed;
  if ("embedUrl" in videoPlatformConfig) {
    urlEmbed = videoPlatformConfig.embedUrl(id);
  }

  let content: JSX.Element;
  if (showIframeThumbnail && urlEmbed) {
    content = (
      <iframe
        allowFullScreen
        referrerPolicy="no-referrer"
        allow="encrypted-media"
        sandbox="allow-same-origin allow-scripts"
        loading="lazy"
        src={urlEmbed}
        draggable={false}
        className="pointer-events-none mx-auto aspect-video w-full max-w-2xl select-none rounded-lg border-0 shadow-xl"
      />
    );
  } else {
    content = (
      <div
        className={
          "flex w-fit flex-col items-center justify-center rounded-lg text-center text-black " +
          (showIframeThumbnail
            ? "gap-2 bg-white p-4 shadow-xl"
            : "gap-0.5 bg-white/60 p-2 text-sm shadow-lg")
        }
      >
        <VideoPlatformIcon
          platform={videoPlatformConfig.key}
          className="h-5 w-5"
        />
        {showIframeThumbnail && "Open "}
        {videoPlatformConfig.label}
        {showIframeThumbnail && " in tab."}
      </div>
    );
  }

  linkAttributes = {
    href: normalizedUrl,
    ...linkAttributes,
  };

  if (urlEmbed && openInLightbox) {
    linkAttributes = {
      "data-pswp-type": "iframe",
      "data-iframe-url": urlEmbed,
      ...linkAttributes,
    };
  }

  return (
    <div className="flex items-center justify-center">
      <a {...linkAttributes}>{content}</a>
    </div>
  );
}