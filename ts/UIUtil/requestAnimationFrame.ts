module UIUtil
{
    interface RAFWithVendorPrefix extends Window {
        mozRequestAnimationFrame(callback: FrameRequestCallback): number;
        webkitRequestAnimationFrame(callback: FrameRequestCallback): number;
    }
    if (!('requestAnimationFrame' in window)) {
        window.requestAnimationFrame =
            (<RAFWithVendorPrefix>window).mozRequestAnimationFrame
            || (<RAFWithVendorPrefix>window).webkitRequestAnimationFrame
            || (<RAFWithVendorPrefix>window).msRequestAnimationFrame;
    }
}
