import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const newsStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 4,
    },

    /* Ticker */
    tickerContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: -16,
        borderRadius: 12,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#eee',
    },
    tickerLabel: {
        backgroundColor: 'rgba(250, 112, 154, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 12,
        marginRight: 8,
    },
    tickerLabelText: {
        color: '#fa709a',
        fontSize: 11,
        fontWeight: '800',
    },
    tickerText: {
        fontSize: 13,
        color: '#444',
        fontWeight: '500',
        flex: 1,
    },

    /* Category Tabs */
    tabsContainer: {
        marginTop: 24,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    tabActive: {
        backgroundColor: '#fa709a',
        borderColor: '#fa709a',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    tabTextActive: {
        color: 'white',
    },

    /* News Grid */
    section: {
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 24,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1b1e',
        marginBottom: 16,
        marginTop: 8,
    },
    newsCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#eff2f5',
    },
    newsImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    newsContent: {
        padding: 20,
    },
    category: {
        fontSize: 11,
        fontWeight: '800',
        color: '#fa709a',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    newsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1b1e',
        lineHeight: 24,
        marginBottom: 8,
    },
    newsExcerpt: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 16,
    },
    newsFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    source: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94a3b8',
        flex: 1,
    },
    readMore: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    readMoreText: {
        color: '#fa709a',
        fontSize: 13,
        fontWeight: '700',
        marginRight: 4,
    },

    /* Side Briefs Section (Mobile Style) */
    briefsSection: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#eff2f5',
    },
    briefItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    briefTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        lineHeight: 20,
    },
    briefMeta: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 4,
    },

    loader: {
        marginTop: 50,
        marginBottom: 50,
    }
});
