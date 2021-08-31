export class DefaultSimData {
    static defaultSimData = {
        selectedHuc: null,
        selectedCatchment: null,
        selectedComId: null,
        waiting: false,
        simId: null,
        status: "Starting...",
        status_message: "Initializing...",
        sim_executing: false,
        sim_completed: false,
        catchment_status: [],
        network: {
            pour_point_comid: null,
            segments: {
                boundary: [],
                headwater: [],
                inNetwork: [],
            },
            order: null,
            sources: null,
            catchment_data: [],
        },
        Location: {
            Locale: {},
            Remin: {},
        },
        jsonFlags: [],
        base_json: null,
        PSetup: {
            firstDay: "2000-01-01T00:00:00", // default one month
            lastDay: "2000-01-31T00:00:00", // time span
            stepSizeInDays: true,
            useFixStepSize: false,
        },
    };
}
