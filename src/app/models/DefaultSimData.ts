export class DefaultSimData {
  static defaultSimData = {
    simId: null,
    selectedComId: null,
    sim_status: {
      status: "Starting...",
      status_message: "Initializing...",
      catchment_status: [],
      waiting: false,
      sim_completed: false,
    },
    network: {
      pour_point_comid: null,
      segments: {
        boundary: [],
        headwater: [],
        inNetwork: [],
      },
      order: null,
      sources: null,
    },
    Location: {
      Locale: {},
      Remin: {},
    },
    PSetup: {
      firstDay: "2000-01-01T00:00:00", // default one month
      lastDay: "2000-01-31T00:00:00", // time span
      stepSizeInDays: true,
      useFixStepSize: false,
    },
    base_json: null,
  };
}
