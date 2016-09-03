/*
 * Copyright (c) 2015 ARATA Mizuki
 * This software is released under the MIT license.
 * See LICENSE.txt.
 */

module UIUtil
{
    interface RAFWithVendorPrefix extends Window {
        mozRequestAnimationFrame(callback: FrameRequestCallback): number;
        webkitRequestAnimationFrame(callback: FrameRequestCallback): number;
        msRequestAnimationFrame(callback: FrameRequestCallback): number;
    }
    if (!('requestAnimationFrame' in window)) {
        window.requestAnimationFrame =
            (<RAFWithVendorPrefix>window).mozRequestAnimationFrame
            || (<RAFWithVendorPrefix>window).webkitRequestAnimationFrame
            || (<RAFWithVendorPrefix>window).msRequestAnimationFrame;
    }
}
