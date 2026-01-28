// src/pages/Tachos/TachosCercaDeMi.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, UrlTile } from 'react-native-maps';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getTachos } from '../../api/tachoApi';
import api from '../../api/axiosConfig';
import { tachosStyles, colors } from '../../styles/mobileStyles';

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default function TachosCercaDeMi({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState(null);
  const [tachosPublicos, setTachosPublicos] = useState([]);
  const [tachosCerca, setTachosCerca] = useState([]);
  const [search, setSearch] = useState('');

  const loadTachos = useCallback(async () => {
    try {
      const res = await getTachos();
      const data = res?.data?.results || res?.data || [];

      const publicosActivos = data.filter(t => t?.tipo === 'publico' && t?.estado === 'activo');
      setTachosPublicos(publicosActivos);

      if (userLoc) {
        const cerca = publicosActivos.filter(t => {
          const lat = parseFloat(t.ubicacion_lat);
          const lon = parseFloat(t.ubicacion_lon);
          if (isNaN(lat) || isNaN(lon)) return false;
          const d = haversineKm(userLoc.lat, userLoc.lon, lat, lon);
          return d <= 10;
        }).map(t => {
          const lat = parseFloat(t.ubicacion_lat);
          const lon = parseFloat(t.ubicacion_lon);
          const d = haversineKm(userLoc.lat, userLoc.lon, lat, lon);
          return { ...t, _distKm: d };
        }).sort((a,b) => a._distKm - b._distKm);
        setTachosCerca(cerca);
      }
    } catch (e) {
      console.warn('Error cargando tachos', e?.message);
      setTachosPublicos([]);
      setTachosCerca([]);
    }
  }, [userLoc]);

  const getUserLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setUserLoc({ lat: -2.90055, lon: -79.00453 }); // Cuenca fallback
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude });
    } catch (e) {
      setUserLoc({ lat: -2.90055, lon: -79.00453 });
    }
  }, []);

  useEffect(() => {
    (async () => {
      await getUserLocation();
    })();
  }, [getUserLocation]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadTachos();
      setLoading(false);
    })();
  }, [userLoc, loadTachos]);

  const filtered = (search ? tachosCerca.filter(t => {
    const s = search.toLowerCase();
    return (
      (t.nombre||'').toLowerCase().includes(s) ||
      (t.codigo||'').toLowerCase().includes(s) ||
      (t.empresa_nombre||'').toLowerCase().includes(s)
    );
  }) : tachosCerca);

  const openTacho = (tacho) => {
    navigation.navigate('TachoDetail', { id: tacho.id });
  };

  const openMaps = (lat, lon) => {
    if (!lat || !lon) return;
    const url = `https://www.google.com/maps?q=${lat},${lon}`;
    // Linking may be used, but here we rely on TachoDetail’s map action as well
  };

  const region = userLoc ? {
    latitude: userLoc.lat,
    longitude: userLoc.lon,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : null;

  return (
    <View style={tachosStyles.screenContainer}>
      {/* Header */}
      <View style={tachosStyles.header}>
        <View style={tachosStyles.headerTitleContainer}>
          <Text style={tachosStyles.headerTitle}>Tachos Públicos Cerca de Mí</Text>
          <Text style={tachosStyles.headerSubtitle}>Encuentra tachos activos en un radio de 10km</Text>
        </View>
        <View style={tachosStyles.headerActions}>
          <TouchableOpacity style={[tachosStyles.btn, tachosStyles.btnSecondary]} onPress={getUserLocation}>
            <Ionicons name="navigate" size={18} color={colors.dark} />
            <Text style={[tachosStyles.btnText, tachosStyles.btnSecondaryText]}>Ubicación</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={tachosStyles.searchContainer}>
        <View style={tachosStyles.searchInputContainer}>
          <Ionicons name="search" size={18} color={colors.gray} />
          <TextInput
            style={tachosStyles.searchInput}
            placeholder="Buscar tachos..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={tachosStyles.listContainer}>
        {/* Summary */}
        <View style={tachosStyles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.dark }}>
              {filtered.length} tachos encontrados en un radio de 10km
            </Text>
            <View style={[tachosStyles.badge, tachosStyles.badgeActive]}>
              <View style={[tachosStyles.badgeIndicator, { backgroundColor: '#065F46' }]} />
              <Text style={[tachosStyles.badgeText, tachosStyles.badgeTextActive]}>Activo</Text>
            </View>
          </View>
        </View>

        {/* Map */}
        <View style={[tachosStyles.mapContainer, { height: 320 }] }>
          {region ? (
            <MapView
              style={{ width: '100%', height: '100%' }}
              region={region}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              showsUserLocation
              showsMyLocationButton
            >
              {/* OpenStreetMap tiles to avoid Google API key requirement */}
              <UrlTile
                urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
              />
              {/* User marker */}
              <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }}>
                <View style={tachosStyles.mapMarker}>
                  <Ionicons name="person" size={22} color="#FFFFFF" />
                </View>
                <Callout><Text>Tu ubicación</Text></Callout>
              </Marker>

              {/* Tachos markers */}
              {filtered.map(t => {
                const lat = parseFloat(t.ubicacion_lat);
                const lon = parseFloat(t.ubicacion_lon);
                if (isNaN(lat) || isNaN(lon)) return null;
                const distKm = typeof t._distKm === 'number' ? t._distKm : haversineKm(region.latitude, region.longitude, lat, lon);
                const estadoActivo = t.estado === 'activo';
                const nivel = parseFloat(t.nivel_llenado || 0);
                return (
                  <Marker key={t.id} coordinate={{ latitude: lat, longitude: lon }}>
                    <View style={[tachosStyles.mapMarker, { backgroundColor: colors.primary }]}>
                      <MaterialCommunityIcons name="trash-can" size={22} color="#FFFFFF" />
                    </View>
                    <Callout onPress={() => openTacho(t)}>
                      <View style={{ maxWidth: 240 }}>
                        {/* Header */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
                          <View style={{ backgroundColor: '#ecfdf5', padding: 8, borderRadius: 16 }}>
                            <MaterialCommunityIcons name="trash-can" size={18} color={colors.primary} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ marginBottom: 4, fontSize: 15, fontWeight: '700', color: '#1f2937' }}>{t.nombre}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Ionicons name="pricetag" size={12} color="#6b7280" />
                              <Text style={{ fontSize: 12, color: '#6b7280' }}>{t.codigo}</Text>
                            </View>
                          </View>
                        </View>

                        {/* Empresa + Estado */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="business" size={13} color="#6b7280" />
                            <Text style={{ fontSize: 13, color: '#4b5563' }}>{t.empresa_nombre || 'Tacho Público'}</Text>
                          </View>
                          <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, backgroundColor: estadoActivo ? '#d1fae5' : '#fef3c7' }}>
                            <Text style={{ fontSize: 11, color: estadoActivo ? '#065f46' : '#92400e', fontWeight: '600', textTransform: 'uppercase' }}>{estadoActivo ? 'Activo' : (t.estado || 'Inactivo')}</Text>
                          </View>
                        </View>

                        {/* Nivel de llenado */}
                        <View style={{ marginBottom: 8 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Ionicons name="battery-half" size={12} color="#6b7280" />
                              <Text style={{ fontSize: 12, color: '#6b7280' }}>Llenado:</Text>
                            </View>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#1f2937' }}>{isNaN(nivel) ? 0 : nivel}%</Text>
                          </View>
                          <View style={{ height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                            <View style={{ height: '100%', width: `${isNaN(nivel) ? 0 : nivel}%`, backgroundColor: nivel >= 80 ? '#ef4444' : (nivel >= 50 ? '#f59e0b' : '#10b981') }} />
                          </View>
                        </View>

                        {/* Distancia */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, paddingHorizontal: 8, paddingVertical: 6, backgroundColor: '#eff6ff', borderRadius: 6 }}>
                          <Ionicons name="navigate" size={12} color="#1d4ed8" />
                          <Text style={{ fontSize: 11, color: '#1d4ed8', fontWeight: '500' }}>A {distKm.toFixed(1)} km de tu ubicación</Text>
                        </View>

                        {/* Coordenadas */}
                        <Text style={{ fontSize: 10, color: '#9ca3af', marginBottom: 10 }}>{lat.toFixed(6)}, {lon.toFixed(6)}</Text>

                        {/* Acción */}
                        <TouchableOpacity
                          onPress={() => openTacho(t)}
                          style={{ width: '100%', backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="eye" size={14} color="#FFFFFF" />
                            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Ver Detalles Completos</Text>
                          </View>
                        </TouchableOpacity>

                        <Text style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>Toca fuera para cerrar</Text>
                      </View>
                    </Callout>
                  </Marker>
                );
              })}
            </MapView>
          ) : (
            <View style={tachosStyles.loadingContainer}><Text>Obteniendo ubicación...</Text></View>
          )}
        </View>

        {/* List */}
        <View style={tachosStyles.card}>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <Text style={[styles.th, { flex: 1 }]}>Distancia</Text>
            <Text style={[styles.th, { flex: 1 }]}>Código</Text>
            <Text style={[styles.th, { flex: 2 }]}>Nombre</Text>
            <Text style={[styles.th, { flex: 2 }]}>Empresa</Text>
            <Text style={[styles.th, { flex: 1 }]}>Estado</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Acciones</Text>
          </View>

          {filtered.length === 0 ? (
            <View style={tachosStyles.emptyContainer}>
              <Ionicons name="location-outline" size={40} color={colors.gray} style={tachosStyles.emptyIcon} />
              <Text style={tachosStyles.emptyTitle}>No hay tachos públicos cercanos</Text>
              <Text style={tachosStyles.emptyText}>Amplía el radio o actualiza tu ubicación</Text>
            </View>
          ) : (
            filtered.map(t => (
              <View key={t.id} style={styles.row}>
                <Text style={[styles.td, { flex: 1 }]}>{(t._distKm ?? 0).toFixed(1)} km</Text>
                <Text style={[styles.td, { flex: 1 }]}>{t.codigo}</Text>
                <Text style={[styles.td, { flex: 2 }]}>{t.nombre}</Text>
                <Text style={[styles.td, { flex: 2 }]}>{t.empresa_nombre || 'Público'}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{t.estado === 'activo' ? 'Activo' : t.estado}</Text>
                <View style={[styles.td, { flex: 1, alignItems: 'flex-end' }]}>
                  <TouchableOpacity style={styles.viewBtn} onPress={() => openTacho(t)}>
                    <Ionicons name="eye" size={16} color="#0369A1" />
                    <Text style={styles.viewBtnText}>Ver</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  th: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  td: {
    fontSize: 14,
    color: '#334155',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  viewBtnText: {
    color: '#0369A1',
    fontWeight: '600',
    fontSize: 12,
  },
});
// src/navigation/CercaDeMiNavigator.jsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TachosCercaDeMi from '../pages/Tachos/TachosCercaDeMi';
import TachoDetail from '../pages/Tachos/TachoDetail';

const Stack = createStackNavigator();

export default function CercaDeMiNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F8F9FA' },
      }}
    >
      <Stack.Screen name="CercaDeMi" component={TachosCercaDeMi} />
      <Stack.Screen name="TachoDetail" component={TachoDetail} />
    </Stack.Navigator>
  );
}
