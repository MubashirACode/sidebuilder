import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react'

interface EditorPanelProps {
    selectedElement: {
        tagName: string;
        className: string;
        text: string;
        styles: {
            padding: string;
            margin: string;
            backgroundColor: string;
            color: string;
            fontSize: string;
        };

    } | null;

    onUpdate: (updates: any) => void;
    onClose: () => void;
}



const EditorPannel = ({ selectedElement, onUpdate, onClose }: EditorPanelProps) => {



    const [values, setValues] = useState(selectedElement)

    if (!selectedElement || !values) return null

    const handleChange = (field: string, value: string) => {
        const newValues = { ...values, [field]: value };
        if (field in values.styles) {
            newValues.styles = { ...values.styles, [field]: value }
        }
        setValues(newValues)
        onUpdate({ [field]: value });
    }


    const handleStyleChange = (styleName: string, value: string) => {

        const newStyles = { ...values.styles, [styleName]: value };

        setValues({ ...values, styles: newStyles });

        onUpdate({ styles: { [styleName]: value } })


    }


    useEffect(() => {
        setValues(selectedElement)
    }, [selectedElement])




    return (

        <div className="absolute top-6 right-6 z-50 w-80 rounded-xl bg-white p-5 shadow-2xl border border-gray-200 animate-fade-in fade-in  duration-200">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Edit Element</h3>
                <button
                    onClick={onClose}
                    className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-5 text-sm">
                {/* Text Content */}
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Text Content</label>
                    <textarea
                        value={values.text}
                        onChange={(e) => handleChange('text', e.target.value)}
                        className="min-h-[80px] text-gray-900 w-full rounded-lg border border-gray-400 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y"
                    />
                </div>

                {/* Class Name */}
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Class Name</label>
                    <input
                        type="text"
                        value={values.className || ''}
                        onChange={(e) => handleChange('className', e.target.value)}
                        className="w-full rounded-lg text-gray-900 border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    />
                </div>

                {/* Grid for spacing & size */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">Padding</label>
                        <input
                            type="text"
                            value={values.styles.padding}
                            onChange={(e) => handleStyleChange('padding', e.target.value)}
                            className="w-full text-sm p-2 text-gray-900 border border-gray-400 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">Margin</label>
                        <input
                            type="text"
                            value={values.styles.margin}
                            onChange={(e) => handleStyleChange('margin', e.target.value)}
                            className="w-full text-sm text-gray-900 p-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                {/* Font Size + Colors */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">Font Size</label>
                        <input
                            type="text"
                            value={values.styles.fontSize}
                            onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                            className="w-full text-sm p-2 text-gray-900 border border-gray-400 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    {/* Background Color */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">Background</label>
                        <div className="flex items-center gap-2 rounded-lg border border-gray-300 p-2">
                            <input
                                type="color"
                                value={
                                    values.styles.backgroundColor === 'rgba(0,0,0,0)'
                                        ? '#ffffff'
                                        : values.styles.backgroundColor
                                }
                                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                                className="h-8 w-8 cursor-pointer rounded border-none p-0"
                            />
                            <span className="truncate text-xs text-gray-600">
                                {values.styles.backgroundColor}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Text Color */}
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Text Color</label>
                    <div className="flex items-center gap-2 rounded-lg border border-gray-300 p-2">
                        <input
                            type="color"
                            value={values.styles.color}
                            onChange={(e) => handleStyleChange('color', e.target.value)}
                            className="h-8 w-8 cursor-pointer rounded border-none p-0"
                        />
                        <span className="truncate text-xs text-gray-600">{values.styles.color}</span>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default EditorPannel