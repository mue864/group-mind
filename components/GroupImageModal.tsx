import groupImages from "@/assets/images/group_images";
import { memo } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Modal, Portal, Button } from "react-native-paper";

interface ImageProp {
  show: boolean;
  onDismiss: () => void;
  onImageSelect: (imageUrl: string) => void;
}

interface GroupImagesProp {
  groupImage1: string,
  groupImage2: string,
  groupImage3: string,
  groupImage4: string,
  groupImage5: string,
  groupImage6: string,
  groupImage7: string,
  groupImage8: string,
  groupImage9: string,
  groupImage10: string,
  groupImage11: string,
}

const GroupImageModal = ({ show, onDismiss, onImageSelect }: ImageProp) => {
  // Get all group images from the imported module

  const handleImageSelect = (imageUri: string) => {
    onImageSelect(imageUri);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={show}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Text style={styles.title}>Select Group Image</Text>
        <ScrollView contentContainerStyle={styles.imagesContainer}>
          {Object.entries(groupImages).map(([name, source]) => (
            <TouchableOpacity
              key={name}
              style={styles.imageWrapper}
              onPress={() => handleImageSelect(name)}
            >
              <Image 
                source={groupImages[name as keyof GroupImagesProp]}
                resizeMode="contain"
                style={styles.image}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Button mode="contained" onPress={onDismiss} style={styles.closeButton}>
          Close
        </Button>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
  },
  imageWrapper: {
    width: '30%',
    aspectRatio: 1,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    padding: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  closeButton: {
    marginTop: 15,
  },
});

export default memo(GroupImageModal);