import React, { useState } from "react";
import { Image, ImageProps } from "react-native";
const fallBackImage = require("@/assets/images/fallBackImage.jpg");

interface Props extends ImageProps {
  fallback?: string;
}

const ImageWithFallback: React.FC<Props> = ({ fallback, source, ...props }) => {
  const [imgSource, setImgSource] = useState<any>(source);

  const handleError = () => {
    setImgSource(fallback);
  };

  return (
    <Image
      source={imgSource || fallback || fallBackImage}
      onError={handleError}
      {...props}
    />
  );
};

export default ImageWithFallback;
