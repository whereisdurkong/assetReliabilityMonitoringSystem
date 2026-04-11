USE [arms_master]
GO

/****** Object:  Table [dbo].[asset_analysis_master]    Script Date: 4/11/2026 10:02:42 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[asset_analysis_master](
	[asset_analysis_id] [int] IDENTITY(1,1) NOT NULL,
	[asset_id] [nvarchar](100) NULL,
	[asset_running_hours] [nvarchar](100) NULL,
	[oil_running_hours] [nvarchar](100) NULL,
	[recommendations] [nvarchar](max) NULL,
	[analysis_date] [datetime] NULL,
	[created_by] [nvarchar](100) NULL,
	[created_at] [datetime] NULL,
	[updated_by] [nvarchar](100) NULL,
	[updated_at] [datetime] NULL,
	[is_active] [varchar](100) NULL,
	[level1] [varchar](100) NULL,
	[level2] [varchar](100) NULL,
	[level3] [varchar](100) NULL,
	[additional_notes] [varchar](max) NULL,
	[asset_name] [varchar](255) NULL,
	[asset_component_id] [varchar](255) NULL,
	[iron] [decimal](18, 4) NULL,
	[chrome] [decimal](18, 4) NULL,
	[nickel] [decimal](18, 4) NULL,
	[aluminium] [decimal](18, 4) NULL,
	[lead] [decimal](18, 4) NULL,
	[copper] [decimal](18, 4) NULL,
	[tin] [decimal](18, 4) NULL,
	[titanium] [decimal](18, 4) NULL,
	[silver] [decimal](18, 4) NULL,
	[antimony] [decimal](18, 4) NULL,
	[cadmium] [decimal](18, 4) NULL,
	[manganese] [decimal](18, 4) NULL,
	[fatigue_gt_20um] [decimal](18, 4) NULL,
	[non_metallic_gt_20um] [decimal](18, 4) NULL,
	[large_fe] [decimal](18, 4) NULL,
	[fe_wear_severity_index] [decimal](18, 4) NULL,
	[total_fe_lt_100um] [decimal](18, 4) NULL,
	[cutting_gt_20um] [decimal](18, 4) NULL,
	[sliding_gt_20um] [decimal](18, 4) NULL,
	[large_fe_percent] [decimal](18, 4) NULL,
	[iso_4406_code_gt4um] [nvarchar](50) NULL,
	[iso_4406_code_gt6um] [nvarchar](50) NULL,
	[iso_4406_code_gt14um] [nvarchar](50) NULL,
	[cnts_gt4] [int] NULL,
	[cnts_gt6] [int] NULL,
	[cnts_gt14] [int] NULL,
	[particles_5_15um] [int] NULL,
	[particles_15_25um] [int] NULL,
	[particles_25_50um] [int] NULL,
	[particles_50_100um] [int] NULL,
	[particles_gt100um] [int] NULL,
	[molybdenum] [decimal](18, 4) NULL,
	[calcium] [decimal](18, 4) NULL,
	[magnesium] [decimal](18, 4) NULL,
	[phosphorus] [decimal](18, 4) NULL,
	[zinc] [decimal](18, 4) NULL,
	[barium] [decimal](18, 4) NULL,
	[boron] [decimal](18, 4) NULL,
	[sodium] [decimal](18, 4) NULL,
	[vanadium] [decimal](18, 4) NULL,
	[potassium] [decimal](18, 4) NULL,
	[lithium] [decimal](18, 4) NULL,
	[silicon] [decimal](18, 4) NULL,
	[total_water] [decimal](18, 4) NULL,
	[bubbles] [nvarchar](50) NULL,
	[water] [decimal](18, 4) NULL,
	[glycol_percent] [decimal](18, 4) NULL,
	[soot_percent] [decimal](18, 4) NULL,
	[biodiesel_fuel_dilution] [decimal](18, 4) NULL,
	[tan] [decimal](18, 4) NULL,
	[tbn] [decimal](18, 4) NULL,
	[oxidation] [decimal](18, 4) NULL,
	[nitration] [decimal](18, 4) NULL,
	[sulfation] [decimal](18, 4) NULL,
	[viscosity_at_40c] [decimal](18, 4) NULL,
	[viscosity_at_100c] [decimal](18, 4) NULL,
	[fluid_integrity] [nvarchar](100) NULL,
	[antiwear_percent] [decimal](18, 4) NULL,
PRIMARY KEY CLUSTERED 
(
	[asset_analysis_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[asset_analysis_master] ADD  DEFAULT (getdate()) FOR [created_at]
GO


