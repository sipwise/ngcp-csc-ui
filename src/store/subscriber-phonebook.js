import { LIST_DEFAULT_ROWS } from 'src/api/common'
import {
    createPhonebook,
    deleteEntry,
    getEntryById,
    getPhonebook,
    setSharedValue,
    updateEntry
} from 'src/api/subscriber-phonebook'

export default {
    namespaced: true,
    state: {
        phonebookRows: [],
        pagination: {
            sortBy: 'id',
            descending: false,
            page: 1,
            rowsPerPage: LIST_DEFAULT_ROWS,
            rowsNumber: 0
        },
        numberInput: null
    },
    getters: {
        getEntryById: (state) => (id) => {
            return state.phonebookRows.find((entry) => entry.id === id)
        },
        getPrefilledNumber: (state) => state.numberInput,
        phonebookRows: (state) => state.phonebookRows,
        pagination: (state) => state.pagination
    },
    mutations: {
        setPhonebookRows (state, rows) {
            state.phonebookRows = rows
        },
        setPagination (state, pagination) {
            state.pagination = { ...state.pagination, ...pagination }
        },
        setSharedValue (state, { id, value }) {
            const index = state.phonebookRows.findIndex((row) => {
                return row.id === id
            })
            if (index > -1) {
                state.phonebookRows[index].shared = value
            }
        },
        setNumber (state, numberInput) {
            state.numberInput = numberInput
        }
    },
    actions: {
        async loadPhonebook ({ commit }, options) {
            try {
                const list = await getPhonebook({
                    ...options
                })
                commit('setPhonebookRows', list.items || [])
                commit('setPagination', {
                    page: options.page,
                    rowsPerPage: options.rows,
                    rowsNumber: list.totalCount
                })
                return list
            } catch (err) {
                commit('setPhonebookRows', [])
                throw err
            }
        },
        async removeEntry (context, { row, subscriberId }) {
            await deleteEntry(subscriberId, row.id)
        },
        async getEntry (context, { id, subscriberId }) {
            const cachedEntry = context.getters.getEntryById(id)
            if (cachedEntry) {
                return cachedEntry
            }
            // Fetch from API if not in store
            const response = await getEntryById(subscriberId, id)
            return response
        },
        async createPhonebook (context, data) {
            await createPhonebook(data)
        },
        async updateEntry (context, data) {
            await updateEntry(data)
        },
        async updateSharedValue (context, row) {
            const newValue = !row.shared
            context.commit('setSharedValue', { id: row.id, value: newValue })
            await setSharedValue(row, newValue)
        }
    }
}
