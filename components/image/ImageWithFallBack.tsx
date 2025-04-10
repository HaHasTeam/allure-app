import React, { useState } from "react";
import { Image, ImageProps } from "react-native";
const fallBackImage = require("@/assets/images/fallBackImage.jpg");

interface Props extends ImageProps {
  src: string;
  fallback?: string;
}

const ImageWithFallback: React.FC<Props> = ({ fallback, src, ...props }) => {
  const [imgSource, setImgSource] = useState<string>(src);

  const handleError = () => {
    setImgSource(fallback ?? fallBackImage);
  };
  return (
    <Image
      source={imgSource ? { uri: imgSource } : fallback || fallBackImage}
      onError={handleError}
      {...props}
    />
  );
};

export default ImageWithFallback;
