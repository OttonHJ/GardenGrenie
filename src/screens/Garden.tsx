import { AddPlantModal } from "@/src/components/AddPlantModal";
import { GardenEmpty } from "@/src/components/GardenEmpty";
import { GardenFilterBar } from "@/src/components/GardenFilterBar";
import { GardenSearchBar } from "@/src/components/GardenSearchBar";
import { GardenTopBar } from "@/src/components/GardenTopBar";
import PlantCard, { Plant } from "@/src/components/PlantCard";
import { MOCK_PLANTS } from "@/src/data/mockPlants";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import {
  FilterId,
  SortId,
  calcNextWatering,
  matchesFilter,
  sortPlants,
} from "@/src/utils/plantUtils";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Garden() {
  const insets = useSafeAreaInsets();
  const { theme, styles } = useProfileTheme(stylesByMode);

  // ── Estado ──────────────────────────────────────────────────────────────────
  const [plants, setPlants] = useState<Plant[]>(MOCK_PLANTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setFilter] = useState<FilterId>("all");
  const [sortBy, setSortBy] = useState<SortId>("name");
  const [modalVisible, setModal] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);

  // ── Filtrado + búsqueda + ordenamiento ──────────────────────────────────────
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

  // ── Handlers ────────────────────────────────────────────────────────────────

  // Agregar planta nueva
  const handleAddPlant = (newPlant: Plant) => {
    setPlants((prev) => [newPlant, ...prev]);
  };

  // Guardar edición de planta existente
  const handleSavePlant = (updatedPlant: Plant) => {
    setPlants((prev) =>
      prev.map((p) => (p.id === updatedPlant.id ? updatedPlant : p)),
    );
    setEditingPlant(null);
  };

  // Registrar riego: actualiza lastWatered y recalcula nextWatering
  const handleWater = (plantId: string) => {
    setPlants((prev) =>
      prev.map((p) => {
        if (p.id !== plantId) return p;
        const match = p.waterFrequency.match(/\d+/);
        const days = match ? parseInt(match[0]) : 7;
        return {
          ...p,
          lastWatered: new Date().toISOString().split("T")[0],
          nextWatering: calcNextWatering(days),
        };
      }),
    );
  };

  // Eliminar planta
  const handleDelete = (plantId: string) => {
    setPlants((prev) => prev.filter((p) => p.id !== plantId));
  };

  // Abrir modal en modo edición
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

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GardenTopBar
        plantCount={filteredPlants.length}
        activeFilter={activeFilter}
        onAddPress={() => setModal(true)}
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
          onAddPress={() => setModal(true)}
          onClearFilter={handleClearFilters}
        />
      ) : (
        <FlatList
          data={filteredPlants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PlantCard
              plant={item}
              colors={theme.colors}
              onPress={() => {}}
              onEdit={handleEdit}
              onWater={handleWater}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <AddPlantModal
        visible={modalVisible}
        editingPlant={editingPlant}
        onClose={handleCloseModal}
        onPlantAdded={handleAddPlant}
        onPlantEdited={handleSavePlant}
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
