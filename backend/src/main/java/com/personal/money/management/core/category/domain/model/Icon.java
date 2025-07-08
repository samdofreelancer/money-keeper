package com.personal.money.management.core.category.domain.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Column;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "icons")
public class Icon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Label cannot be blank")
    @NotNull(message = "Label cannot be null")
    private String label;

    @Column(name = "icon_value")
    @NotBlank(message = "Icon value cannot be blank")
    @NotNull(message = "Icon value cannot be null")
    private String iconValue;

    public Icon() {
    }

    public Icon(String label, String iconValue) {
        this.label = label;
        this.iconValue = iconValue;
    }

    public Long getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        if (label == null) {
            throw new IllegalArgumentException("Label cannot be null");
        }
        this.label = label;
    }
    
    public String getIconValue() {
        return iconValue;
    }
    
    public void setIconValue(String iconValue) {
        if (iconValue == null) {
            throw new IllegalArgumentException("Icon value cannot be null");
        }
        this.iconValue = iconValue;
    }
}
