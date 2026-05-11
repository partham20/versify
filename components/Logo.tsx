import { Platform, View, type StyleProp, type ViewStyle } from "react-native";
import { SvgXml } from "react-native-svg";
import { LOGO_LIGHT_XML, LOGO_XML } from "./logoXml";

const ASPECT = {
  default: 1536 / 1024,
  light: 1916 / 821,
} as const;

type Variant = "default" | "light";

type Props = {
  height?: number;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
};

export function Logo({ height = 40, variant = "light", style }: Props) {
  const aspect = ASPECT[variant];
  const width = height * aspect;
  const xml = variant === "light" ? LOGO_LIGHT_XML : LOGO_XML;

  if (Platform.OS === "web") {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <div
        style={{
          width,
          height,
          display: "inline-block",
          lineHeight: 0,
          ...((style as object) ?? {}),
        }}
        dangerouslySetInnerHTML={{ __html: xml }}
      />
    );
  }

  return (
    <View style={[{ height, width }, style]}>
      <SvgXml xml={xml} width={width} height={height} />
    </View>
  );
}

export const LogoMark = Logo;
