package com.m4hub.backend.util;

import com.m4hub.backend.model.Song;
import com.m4hub.backend.repository.SongRepository;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class DataGenerator {

    private final SongRepository songRepository;
    private final Random random = new Random();

    public DataGenerator(SongRepository songRepository) {
        this.songRepository = songRepository;
    }

    private static final String[] ENG_TITLES = {"Midnight Sky", "Ocean Eyes", "Blinding Lights", "Levitating", "Peaches", "Stay", "Bad Habits", "Flowers", "Starboy", "Creepin", "Anti-Hero", "Cruel Summer", "Vampire", "Paint The Town Red", "Houdini", "Greedy", "Lovin On Me", "Water", "Agora Hills", "Rich Baby Daddy"};
    private static final String[] ENG_ARTISTS = {"The Weeknd", "Dua Lipa", "Justin Bieber", "Miley Cyrus", "Taylor Swift", "Post Malone", "Doja Cat", "Olivia Rodrigo", "Jack Harlow", "Tyla"};

    private static final String[] HIN_TITLES = {"Chaleya", "Tum Kya Mile", "Satranga", "Lutt Putt Gaya", "Pehle Bhi Main", "Arjan Vailly", "Heeriye", "Jhoome Jo Pathaan", "Besharam Rang", "Tere Vaaste", "Dil Jhoom", "O Maahi", "Sajni", "Naina", "Tauba Tauba", "Aaj Ki Raat", "Akhiyaan Gulaab", "Soni Soni", "Tainu Khabar Nahi", "Vidaamuyarchi"};
    private static final String[] HIN_ARTISTS = {"Arijit Singh", "Shreya Ghoshal", "Vishal Mishra", "Diljit Dosanjh", "Neeti Mohan", "Badshah", "Karan Aujla", "Javed Ali", "Sunidhi Chauhan", "B Praak"};

    private static final String[] TEL_TITLES = {"Kurchi Madathapetti", "Chuttamalle", "Fear Song", "Bhairava Anthem", "Naa Ready", "Hukum", "Kaavaalaa", "Poonakaalu Loading", "Jai Balayya", "Ammaadi", "Jaragandi", "Souraa", "Dum Masala", "Mastaaru Mastaaru", "Srivalli", "Saami Saami", "Oo Antava", "Eyy Bidda Idhi Naa Adda", "Bulletto Bandekki", "Ramuloo Ramulaa"};
    private static final String[] TEL_ARTISTS = {"Anirudh Ravichander", "Sid Sriram", "Thaman S", "Devi Sri Prasad", "Shilpa Rao", "Rahul Sipligunj", "Anurag Kulkarni", "Mangli", "Ram Miriyala", "Geetha Madhuri"};

    private static final String[] KAN_TITLES = {"Dwapara", "Jeeva Neene", "Chinnamma", "Hey Gagana", "Kavithe Kavithe", "Dheera Dheera", "Salaam Rocky Bhai", "Mehabooba", "Sulthana", "Belageddu", "Hands Up", "Singara Siriye", "Pasandaagavne", "Yenammi Yenammi", "Open Hairu", "Tunturu", "Usire Usire", "Kariya I Love You", "Nooraaru Kalaga", "Sanju Weds Geetha"};
    private static final String[] KAN_ARTISTS = {"Vijay Prakash", "Sonu Nigam", "Sanjith Hegde", "Arjun Janya", "Chandan Shetty", "All Ok", "Ananya Bhat", "Shreya Ghoshal", "Rajesh Krishnan", "Anuradha Bhat"};

    private static final String[] GENRES = {"Pop", "Rock", "Classical", "Folk", "EDM", "Jazz", "Hip-Hop", "Soul", "R&B", "Melody"};

    private static final String[][] FEATURED_SONGS = {
        {"Manmohini", "Arijit Singh Remix", "Hindi", "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3", "200", "Indian Melody"},
        {"Kodagina Kaveri", "Vijay Prakash Classic", "Kannada", "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Scott_Holmes/Inspiring__Upbeat_Music/Scott_Holmes_-_04_-_Upbeat_Party.mp3", "180", "Folk"},
        {"Telusa Telusa", "Sid Sriram Soul", "Telugu", "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Algorithms.mp3", "210", "Romantic"},
        {"Midnight City", "Urban Beat", "English", "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Scott_Holmes/Inspiring__Upbeat_Music/Scott_Holmes_-_04_-_Upbeat_Party.mp3", "190", "Synthwave"},
        {"Ghananam Ghananam", "Carnatic Fusion", "Telugu", "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/KieLoKaz/Free_Ganymed/KieLoKaz_-_03_-_Wow_Kielokaz_ID_359.mp3", "230", "Classical"},
        {"Sajni Re", "Lo-fi Mix", "Hindi", "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kai_Engel/Satin/Kai_Engel_-_04_-_Sentinel.mp3", "160", "Lo-fi"},
        {"Malnad Days", "Nature Flute", "Kannada", "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/Music_for_Video/Komiku/Its_time_for_adventure/Komiku_-_04_-_Skate.mp3", "175", "Instrumental"},
        {"Skyline", "Electric Dreams", "English", "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3", "200", "EDM"},
        {"Raga Bhairavi", "Pandit Ravi Shankar inspired", "Hindi", "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Algorithms.mp3", "210", "Classical"},
        {"Neon Nights", "Synth Pop", "English", "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Scott_Holmes/Inspiring__Upbeat_Music/Scott_Holmes_-_04_-_Upbeat_Party.mp3", "190", "Pop"}
    };

    public void generate500Songs() {
        // Always regenerate to ensure new URLs are used
        songRepository.deleteAll();

        List<Song> songs = new ArrayList<>();
        
        // Ensure library directory exists
        try {
            java.nio.file.Files.createDirectories(java.nio.file.Paths.get("music-library"));
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        // Add 10 Featured Premium Songs First
        for (int i = 0; i < FEATURED_SONGS.length; i++) {
            String[] s = FEATURED_SONGS[i];
            String externalUrl = s[3];
            String filename = "song_" + i + ".mp3";
            String localUrl = "http://localhost:8080/api/music/stream/" + filename;
            
            // Try to download and cache the file
            boolean isDownloaded = downloadFile(externalUrl, "music-library/" + filename);
            
            songs.add(new Song(s[0], s[1], "Premium Collection", Integer.parseInt(s[4]), 
                isDownloaded ? localUrl : externalUrl, 
                "https://images.unsplash.com/photo-" + (1500000000000L + random.nextInt(1000000)) + "?w=400", 
                s[5], "premium-" + i));
        }

        // English (remainder)
        for (int i = 0; i < 115; i++) {
            songs.add(createSong(ENG_TITLES, ENG_ARTISTS, "English", "eng-" + i));
        }
        
        // Hindi (remainder)
        for (int i = 0; i < 115; i++) {
            songs.add(createSong(HIN_TITLES, HIN_ARTISTS, "Hindi", "hin-" + i));
        }
        
        // Telugu (remainder)
        for (int i = 0; i < 115; i++) {
            songs.add(createSong(TEL_TITLES, TEL_ARTISTS, "Telugu", "tel-" + i));
        }
        
        // Kannada (remainder)
        for (int i = 0; i < 115; i++) {
            songs.add(createSong(KAN_TITLES, KAN_ARTISTS, "Kannada", "kan-" + i));
        }

        songRepository.saveAll(songs);
    }

    private Song createSong(String[] titles, String[] artists, String language, String id) {
        String title = titles[random.nextInt(titles.length)];
        String artist = artists[random.nextInt(artists.length)];
        String genre = GENRES[random.nextInt(GENRES.length)] + " (" + language + ")";
        int duration = 180 + random.nextInt(120);
        
        // Pick one of the featured songs randomly for high quality audio
        int audioIndex = random.nextInt(FEATURED_SONGS.length);
        String filename = "song_" + audioIndex + ".mp3";
        // Check if file exists to decide url
        boolean exists = new java.io.File("music-library/" + filename).exists();
        String audioUrl = exists ? 
            "http://localhost:8080/api/music/stream/" + filename :
            FEATURED_SONGS[audioIndex][3];

        String imageUrl = "https://images.unsplash.com/photo-" + (1500000000000L + random.nextInt(1000000)) + "?w=400";
        
        return new Song(title + " #" + (random.nextInt(1000)), artist, language + " Album Hit", duration, audioUrl, imageUrl, genre, id);
    }
    private boolean downloadFile(String urlStr, String destinationPath) {
        java.io.File file = new java.io.File(destinationPath);
        if (file.exists() && file.length() > 0) {
            return true; // Already downloaded
        }
        
        try (java.io.InputStream in = new java.net.URL(urlStr).openStream();
             java.io.FileOutputStream out = new java.io.FileOutputStream(file)) {
            
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = in.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
            return true;
        } catch (Exception e) {
            System.err.println("Failed to download: " + urlStr + " due to " + e.getMessage());
            return false;
        }
    }
}
