import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Carousel, Spacings } from "react-native-ui-lib";
import ImageWithFallback from "../image/ImageWithFallBack";
import { TServerFile } from "@/types/file";
import { getMasterConfigApi } from "@/hooks/api/master-config";
import { useQuery } from "@tanstack/react-query";

const HomeBanner = () => {
  const { data: masterConfig } = useQuery({
    queryKey: [getMasterConfigApi.queryKey],
    queryFn: getMasterConfigApi.fn,
  });

  return (
    <View style={styles.container}>
      <Carousel
        autoplay
        pageWidth={styles.carousel.width - Spacings.s5 * 2}
        itemSpacings={Spacings.s3}
        containerMarginHorizontal={Spacings.s2}
        initialPage={2}
        containerStyle={styles.carouselContainer}
        pageControlPosition={Carousel.pageControlPositions.UNDER}
      >
        {masterConfig?.data[0]?.banners.map(
          (banner: TServerFile, index: number) => (
            <View key={banner.id} style={styles.page}>
              <ImageWithFallback
                src={banner.fileUrl ?? ""}
                style={styles.image}
              />
              <Text margin-15>CARD {index}</Text>
            </View>
          )
        )}
      </Carousel>
    </View>
  );
};

export default HomeBanner;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  carousel: {
    width: 800,
  },
  carouselContainer: {
    position: "relative",
    height: 210,
  },
  page: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
    borderRadius: 10,
  },
});
