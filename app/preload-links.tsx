export default function PreloadLinks() {
    return (
        <>
            {/* Preload hero image for faster LCP - matches actual Next.js Image sizes */}
            <link
                rel="preload"
                as="image"
                href="/_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1677442136019-21780ecad995%3Fixlib%3Drb-4.0.3%26ixid%3DM3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%253D%253D%26auto%3Dformat%26fit%3Dcrop%26w%3D1200%26q%3D80&w=640&q=75"
                imageSrcSet="/_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1677442136019-21780ecad995%3Fixlib%3Drb-4.0.3%26ixid%3DM3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%253D%253D%26auto%3Dformat%26fit%3Dcrop%26w%3D1200%26q%3D80&w=640&q=75 640w, /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1677442136019-21780ecad995%3Fixlib%3Drb-4.0.3%26ixid%3DM3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%253D%253D%26auto%3Dformat%26fit%3Dcrop%26w%3D1200%26q%3D80&w=1080&q=75 1080w"
                fetchPriority="high"
            />
        </>
    );
}
