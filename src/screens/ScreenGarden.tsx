import { GardenEmpty } from "@/src/components/GardenEmpty";
import { GardenFilterBar } from "@/src/components/GardenFilterBar";
import { GardenSearchBar } from "@/src/components/GardenSearchBar";
import { GardenTopBar } from "@/src/components/GardenTopBar";
import PlantCard, { Plant } from "@/src/components/PlantCard";
import { usePlants } from "@/src/context/PlantContext";
import { ModalAddPlant } from "@/src/modals/ModalAddPlant";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import {
  FilterId,
  SortId,
  matchesFilter,
  sortPlants,
} from "@/src/utils/plantUtils";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ScreenGarden() {
  const insets = useSafeAreaInsets();
  const { theme, styles } = useProfileTheme(stylesByMode);

  // ── Estado global de plantas ─────────────────────────────────────────────
  const { plants, addPlant, updatePlant, deletePlant, waterPlant } =
    usePlants();

  // ── Estado local de UI ───────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setFilter] = useState<FilterId>("all");
  const [sortBy, setSortBy] = useState<SortId>("name");
  const [modalVisible, setModal] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);

  // ── Filtrado + búsqueda + ordenamiento ───────────────────────────────────
  const filteredPlants = useMemo(() => {
    let result = plants.filter((p) => matchesFilter(p, activeFilter));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.scientificName.toLowerCase().includes(q),
      );
    }
    return sortPlants(result, sortBy);
  }, [plants, activeFilter, searchQuery, sortBy]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleEdit = (plant: Plant) => {
    setEditingPlant(plant);
    setModal(true);
  };

  const handleCloseModal = () => {
    setModal(false);
    setEditingPlant(null);
  };

  const handleClearFilters = () => {
    setFilter("all");
    setSearchQuery("");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GardenTopBar
        plantCount={filteredPlants.length}
        activeFilter={activeFilter}
        onAddPress={() => {
          setEditingPlant(null);
          setModal(true);
        }}
      />

      <GardenSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery("")}
      />

      <GardenFilterBar
        activeFilter={activeFilter}
        onFilterChange={setFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        resultCount={filteredPlants.length}
      />

      {filteredPlants.length === 0 ? (
        <GardenEmpty
          variant={plants.length === 0 ? "no-plants" : "no-results"}
          onAddPress={() => {
            setEditingPlant(null);
            setModal(true);
          }}
          onClearFilter={handleClearFilters}
        />
      ) : (
        <FlatList
          data={filteredPlants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PlantCard
              plant={item}
              onPress={() => {}}
              onEdit={handleEdit}
              onWater={waterPlant}
              onDelete={deletePlant}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <ModalAddPlant
        visible={modalVisible}
        editingPlant={editingPlant}
        onClose={handleCloseModal}
        onPlantAdded={addPlant}
        onPlantEdited={updatePlant}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bgPrimary,
    },
    listContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
