import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
  showClearButton?: boolean;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  onSearch,
  onClear,
  value = "",
  onChangeText,
  showClearButton = true,
  autoFocus = false,
}) => {
  const [searchQuery, setSearchQuery] = useState(value);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (onChangeText) {
      onChangeText(text);
    }
    onSearch(text);
  };

  const handleClear = () => {
    setSearchQuery("");
    if (onChangeText) {
      onChangeText("");
    }
    if (onClear) {
      onClear();
    }
    onSearch("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
          autoFocus={autoFocus}
          returnKeyType="search"
          clearButtonMode="never"
        />
        {showClearButton && searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 4,
  },
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
});

export default SearchBar;
