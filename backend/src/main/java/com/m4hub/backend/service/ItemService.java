package com.m4hub.backend.service;

import com.m4hub.backend.model.Item;
import com.m4hub.backend.repository.ItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ItemService {
    private final ItemRepository repo;

    public ItemService(ItemRepository repo) { this.repo = repo; }

    public List<Item> findAll() { return repo.findAll(); }

    public Optional<Item> findById(Long id) { return repo.findById(id); }

    public Item create(Item item) { return repo.save(item); }

    public Item update(Long id, Item updated) {
        return repo.findById(id).map(existing -> {
            existing.setTitle(updated.getTitle());
            existing.setContent(updated.getContent());
            return repo.save(existing);
        }).orElseThrow(() -> new RuntimeException("Item not found"));
    }

    public void delete(Long id) { repo.deleteById(id); }
}
