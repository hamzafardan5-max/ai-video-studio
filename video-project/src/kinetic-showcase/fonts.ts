import {loadFont as loadOrbitron} from "@remotion/google-fonts/Orbitron";
import {loadFont as loadSpaceGrotesk} from "@remotion/google-fonts/SpaceGrotesk";

const orbitron = loadOrbitron("normal", {
  weights: ["500", "700", "800", "900"],
  subsets: ["latin"],
});

const spaceGrotesk = loadSpaceGrotesk("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});

export const FONT_DISPLAY = orbitron.fontFamily;
export const FONT_BODY = spaceGrotesk.fontFamily;
