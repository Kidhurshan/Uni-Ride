import * as Location from 'expo-location';

class LocationService {
  async requestPermission() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  async getCurrentLocation() {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  }

  async getAddressFromCoords(latitude, longitude) {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results.length > 0) {
        const address = results[0];
        const parts = [
          address.name,
          address.street,
          address.city,
          address.region,
          address.postalCode,
        ].filter(Boolean);

        return parts.join(', ');
      }

      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  async getCoordsFromAddress(address) {
    try {
      const results = await Location.geocodeAsync(address);

      if (results.length > 0) {
        return {
          latitude: results[0].latitude,
          longitude: results[0].longitude,
        };
      }

      return null;
    } catch (error) {
      console.error('Error geocoding:', error);
      return null;
    }
  }

  async getCurrentAddress() {
    try {
      const coords = await this.getCurrentLocation();
      const address = await this.getAddressFromCoords(
        coords.latitude,
        coords.longitude
      );
      return {
        address,
        coordinates: coords,
      };
    } catch (error) {
      console.error('Error getting current address:', error);
      throw error;
    }
  }
}

export default new LocationService();
